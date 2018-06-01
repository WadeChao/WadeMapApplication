import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateStartLocation } from '../redux/action/locationActions';
import { addRoutOffStops } from '../redux/action/locationActions';
import mockAPIs from '../APIs/mockApi';
import { Button, Form, FormGroup, FormControl, HelpBlock, InputGroup, Grid, Col, Row, Label } from 'react-bootstrap';

class Filter extends Component{

  constructor(props){
    super(props);
    this.state = {
      startAddress:'',
      destinationAddress:'',
      isReadyGetStart:false,
      isReadyGetRouteOff:false,
      startWarning:false,
      destinationWarning:false,
      midStops:[]
    }
  }

  componentDidMount(){
    this.appendAutoCompleted('location-form-input');
  }

  handleMidStopChanged = (event, index) => {
    const {
      midStops
    } = this.state;
    let midStopesArr = midStops;
    midStopesArr[index]['address'] = event.target.value;
    midStopesArr[index]['routeOffWarning'] = false;
    this.setState({midStops:midStopesArr});
  }

  handleDefaultAddressChanged = (event) => {
    if(event.target.name === 'startAddress'){
      this.setState(
        {
          startAddress:event.target.value,
          startWarning:false
        }
      );
    }
    else if(event.target.name === 'destinationAddress'){
      this.setState({
          destinationAddress:event.target.value,
          destinationWarning:false
      });
    }
  }

  handlePostRouteToServer = () => {
    const {
      isReadyGetStart,
      isReadyGetRouteOff
    } = this.state;
    const {
      locReducer,
    } = this.props;
    if(isReadyGetStart && isReadyGetRouteOff){
      let routeArr = [];
      const arrStart = [locReducer.startLocation.lat.toString(), locReducer.startLocation.lng.toString()];
      routeArr.push(arrStart);
      locReducer.routeOffStops.forEach(routeOffStop => {
         const stop = [routeOffStop.lat.toString(), routeOffStop.lng.toString()];
         routeArr.push(stop);
      })
      this.postRoute(routeArr, 3, 1000);
    }
  }

  handleSumitSearch = (event) => {
    if(event !== undefined)
      event.preventDefault();
    const {
      startAddress,
      destinationAddress,
      midStops
    } = this.state;
    const {
      locReducer,
      updateStartLocation,
      addRoutOffStops
    } = this.props;
    if(startAddress !== '' && locReducer.startLocation.address !== startAddress){
      this.getLocationInfo(startAddress).then((value) => {
        updateStartLocation(value.address,value.lat,value.lng);
        this.setState({isReadyGetStart:true});
      }).then(() => {
        this.handlePostRouteToServer();}
      ).catch(error => {
        this.setState({startWarning:true, isReadyGetStart:false});
      });
    }
    let routeOffStops = [];
    midStops.forEach(value => {
      if(value.address !== ''){
        routeOffStops.push(value);
      }
    })
   if(destinationAddress !== ''){
      const destination = {address:destinationAddress};
      routeOffStops.push(destination);
    }
    if(routeOffStops.length>0){
      this.getRouteOffLocations(routeOffStops);
    }
    else {
      addRoutOffStops([]);
    }
  }

  handleAddStop = () => {
    event.preventDefault();
    const {
      midStops
    } = this.state;
    if(midStops.length === 10)
      return;
    let midStopesArr = midStops;
    let newStop = {};
    newStop['address'] = '';
    newStop['routeOffWarning'] = false;
    midStopesArr.push(newStop);
    this.setState({midStops:midStopesArr});
  }

  handleClickRemove = (event,index) => {
    event.preventDefault();
    const {
      midStops
    } = this.state;
    let midStopesArr = midStops;
    midStopesArr.splice(index, 1);
    this.setState({midStops:midStopesArr});
    this.handleSumitSearch();
  }

  handleClickCancel = (event) => {
    event.preventDefault();
    const {
      updateStartLocation,
      addRoutOffStops
    } = this.props;
    this.setState({
      startAddress:'',
      destinationAddress:'',
      isReadyGetStart:false,
      isReadyGetDest:false,
      startWarning:false,
      destinationWarning:false,
      midStops:[]
    });
    updateStartLocation('', 0, 0);
    addRoutOffStops([]);
  }

  async getLocationInfo(address){
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve,reject) => {
      let locationInfo = {};
      geocoder.geocode({ 'address': address}, function(results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
          locationInfo.address = address;
          locationInfo.lat = results[0].geometry.location.lat();
          locationInfo.lng = results[0].geometry.location.lng();
          resolve(locationInfo);
        }
        else{
          reject();
        }
      });
    })
  }

  async postRoute(routeArr, retry, retryDelay){
    const response = await mockAPIs.postRouteAPI(routeArr);
    if(response.status === 200 || response.status === 201) {
    }
    else {
      if(retry>0)
        setTimeout(() => {this.postRoute(routeArr, --retry, retryDelay)}, retryDelay);
    }
  }

  getRouteOffLocations = (routeOffStops) => {
    let routeOffStopsArr = [];
    let getRouteOffCount = 0;
    const {
      addRoutOffStops
    } = this.props;
    routeOffStops.forEach((midStop,index) => this.getLocationInfo(midStop.address).then((value) => {
        const stop = { address:midStop.address, lat:value.lat, lng:value.lng };
        if(routeOffStopsArr.length === 0)
          routeOffStopsArr.push(stop);
        else {
          routeOffStopsArr.splice(index, 0, stop);
        }
        getRouteOffCount++;
        if(getRouteOffCount === routeOffStops.length){
            if(routeOffStopsArr.length>0){
              addRoutOffStops(routeOffStopsArr);
              this.setState({ isReadyGetRouteOff:true});
              this.handlePostRouteToServer();
            }
            else
              this.setState({isReadyGetRouteOff:false});
        }
      }).catch(error => {
        this.setRouteOffWarning(midStop.address);
        getRouteOffCount++;
        if(getRouteOffCount === routeOffStops.length){
          if(routeOffStopsArr.length>0){
            addRoutOffStops(routeOffStopsArr);
            this.setState({isReadyGetRouteOff:true});
            this.handlePostRouteToServer();
          }
          else
            this.setState({isReadyGetRouteOff:false});
        }
      })
    );
  }

  setRouteOffWarning = (address) => {
    const {
      midStops,
      destinationAddress
    } = this.state;
    let midStopsArr = midStops;
    if(destinationAddress === address)
    {
        this.setState({destinationWarning:true});
    }

    midStopsArr.forEach((value, index) => {
      if(value.address === address){
        midStopsArr[index]['routeOffWarning'] = true;
        console.log('midStopsArr',midStopsArr);
        this.setState({midStops:midStopsArr});
        return false;
      }
    })
  }

  addAutocompletedToMidStop = () => {
      this.appendAutoCompleted('stop-form-input');
  }

  appendAutoCompleted = (className) => {
    const componentObject = this;
    let locationInputs = (document.getElementsByClassName(className));
    Array.prototype.filter.call(locationInputs, function(input){
      if(input.autocomplete !== 'off')
      {
        let autoComplete = new google.maps.places.Autocomplete(input);
        autoComplete.addListener('place_changed', function(event) {
              var place = autoComplete.getPlace();
              if (!place.geometry) {
                return;
              }
              if (place.geometry.viewport) {
                if(input.name === 'startAddress'){
                  componentObject.setState({
                      startAddress:place.name,
                      startWarning:false
                  });
                }
                else if(input.name === 'destinationAddress'){
                  componentObject.setState({
                    destinationAddress:place.name,
                    destinationWarning:false
                  });
                }
                else {
                    let midStopIndex = parseInt(input.name.substring(input.name.length-1));
                    const {
                      midStops
                    } = componentObject.state;
                    let midStopesArr = midStops;
                    midStopesArr[midStopIndex]['address'] = place.name;
                    componentObject.setState({midStops:midStopesArr});
                }
                componentObject.handleSumitSearch();
              }
          });
        }
    });
  }

  renderMidStopInputAll = (midStops) => {
    return (
      <div>
        {midStops.map(this.renderMidStopInput)}
      </div>
    )
  }

  renderMidStopInput = (midStop, index) => {
    const {
      midStops
    } = this.state;
    return <div key={index}>
            <FormGroup>
             <Col sm={12}>
               <InputGroup>
                  <FormControl  type='text'
                   className='stop-form-input'
                   name={`midStop-${index}`}
                   placeholder='Mid stop'
                   value={midStop.address}
                   onChange={(event) => this.handleMidStopChanged(event,index)}/>
                  <InputGroup.Addon className='remove-mid-stop-input' onClick={(event) => this.handleClickRemove(event,index)}>X</InputGroup.Addon>
                </InputGroup>
                {midStops[index].routeOffWarning && <HelpBlock className='warning-msg'>Route off location not found</HelpBlock>}
              </Col>
            </FormGroup>
           </div>
  }

  render() {
    const {
      startAddress,
      destinationAddress,
      startWarning,
      destinationWarning,
      midStops
    } = this.state;
    return <div className='filter'>
              <h3 className='filter-title'>Wade Route Application</h3>
              <Form horizontal className='location-form' onSubmit={event => { event.preventDefault(); }}>
              <FormGroup>
               <Col smOffset={8} sm={4}>
                <Button bsSize="small" className='location-form-button' onClick={this.handleAddStop}>Add Stop</Button>
               </Col>
              </FormGroup>
              <FormGroup>
                <Col sm={12}>
                  <FormControl
                    className='location-form-input'
                    type='text'
                    placeholder='Start'
                    name='startAddress'
                    value={this.state.startAddress}
                    onChange={this.handleDefaultAddressChanged}
                  />
                  <FormControl.Feedback />
                  {startWarning && <HelpBlock className='warning-msg'>Start location not found</HelpBlock>}
                </Col>
              </FormGroup>
                {this.renderMidStopInputAll(midStops)}
                {this.addAutocompletedToMidStop()}
                <FormGroup>
                 <Col sm={12}>
                 <FormControl
                 type="text"
                    className='location-form-input'
                    name='destinationAddress'
                    placeholder='Destination'
                    value={this.state.destinationAddress}
                    onChange={this.handleDefaultAddressChanged}
                 />
                 <FormControl.Feedback />
                 {destinationWarning && <HelpBlock className='warning-msg'>Destination not found</HelpBlock>}
                 </Col>
                </FormGroup>
                <FormGroup>
                 <Col sm={6}>
                  <Button className='location-form-button' onClick={this.handleClickCancel}>Cancel</Button>
                 </Col>
                 <Col sm={6}>
                  <Button className='location-form-button' onClick={this.handleSumitSearch}>Submit</Button>
                 </Col>
                </FormGroup>
              </Form>
          </div>
    }
}

const mapStateToProps = ({ locReducer }) => ({
  locReducer
});

const mapDispatchToProps = dispatch => {
  return {
    updateStartLocation:(address, lat, lng) => {
      dispatch(updateStartLocation(address,lat,lng));
    },
    addRoutOffStops:(routeOffStops) => {
      dispatch(addRoutOffStops(routeOffStops));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
