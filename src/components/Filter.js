import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateStartLocation } from '../redux/action/locationActions';
import { addRoutOffStops } from '../redux/action/locationActions';
import mockAPIs from '../APIs/mockApi';

class Filter extends Component{

  constructor(props){
    super(props);
    this.state = {
      startAddress:'',
      destinationAddress:'',
      startCheck:false,
      destinationCheck:false,
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
                      startCheck:true,
                      startWarning:false
                  });
                }
                else if(input.name === 'destinationAddress'){
                  componentObject.setState({
                    destinationAddress:place.name,
                    destinationCheck:true,
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

  handleMidStopChanged = (event, index) => {
    const {
      midStops
    } = this.state;
    let midStopesArr = midStops;
    midStopesArr[index]['address'] = event.target.value;
    this.setState({midStops:midStopesArr});
  }

  handleStartAddressChanged = (event) => {
    let isNonEmpty = (event.target.value !== '') ? true : false;
    this.setState(
      {
        startAddress:event.target.value,
        startCheck:isNonEmpty,
        startWarning:false
      }
    );
  }

  handleDestAddressChanged = (event) => {
    let isNonEmpty = (event.target.value !== '') ? true : false;
    this.setState({
        destinationAddress:event.target.value,
        destinationCheck:isNonEmpty,
        destinationWarning:false
    });
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
      startCheck,
      destinationCheck,
      midStops
    } = this.state;
    const {
      locReducer,
      updateStartLocation,
      addRoutOffStops
    } = this.props;

    if(startCheck && locReducer.startLocation.address !== startAddress){
      this.getLocationInfo(startAddress).then((value) => {
        updateStartLocation(value.address,value.lat,value.lng);
        this.setState({isReadyGetStart:true});
      }).then(() => {
        this.handlePostRouteToServer();}
      ).catch(error => {
        this.setState({isReadyGetStart:false});
      });
    }
   let routeOffStops = [];
   midStops.forEach(value => {
      if(value.address !== ''){
        routeOffStops.push(value);
      }
   })
   if(destinationCheck){
      const destination = {address:destinationAddress};
      routeOffStops.push(destination);
    }
    this.getRouteOffLocations(routeOffStops);
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
            addRoutOffStops(routeOffStopsArr);
            this.setState({ isReadyGetRouteOff:true});
            this.handlePostRouteToServer();
        }
      }).catch(error => {})
    );
  }

  handleKeyPress = (event) => {
    if(event.which === 13) {
      //this.handleSumitSearch();
    }
  }

  handleAddStop = () => {
    event.preventDefault();
    const {
      midStops
    } = this.state;
    let midStopesArr = midStops;
    let newStop = {};
    newStop['address'] = '';
    midStopesArr.push(newStop);
    this.setState({midStops:midStopesArr});
  }

  renderMidStopInputAll = (midStops) => {
    return (
      <div>
        {midStops.map(this.renderMidStopInput)}
      </div>
    )
  }

  addAutocompletedToMidStop = () => {
    this.appendAutoCompleted('stop-form-input');
  }

  renderMidStopInput = (midStop, index) => {
    return <div key={index}>
             <input
                type="text"
                className='stop-form-input'
                name={`midStop-${index}`}
                placeholder='Mid stop'
                value={midStop.address}
                onChange={(event) => this.handleMidStopChanged(event,index)}
             />
             <span onClick={(event) => this.handleClickRemove(event,index)}>X</span>
           </div>
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
      startCheck:false,
      destinationCheck:false,
      isReadyGetStart:false,
      isReadyGetDest:false,
      startWarning:false,
      destinationWarning:false,
      midStops:[]
    });
    updateStartLocation('', 0, 0);
    addRoutOffStops([]);
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
              <div className='filter-title'>Wade Route Application</div>
              <form className='location-form' onSubmit={event => { event.preventDefault(); }}>
                  <input  type='text'
                          className='location-form-input'
                          name='startAddress'
                          placeholder='Start'
                          value={this.state.startAddress}
                          onChange={this.handleStartAddressChanged}
                          onKeyPress={this.handleKeyPress}
                  />
                  {startWarning && <div className='warning-msg'>Start location not found</div>}
                  {this.renderMidStopInputAll(midStops)}
                  {this.addAutocompletedToMidStop()}
                  <input  type="text"
                          className='location-form-input'
                          name='destinationAddress'
                          placeholder='Destination'
                          value={this.state.destinationAddress}
                          onChange={this.handleDestAddressChanged}
                          onKeyPress={this.handleKeyPress}
                  />
                  {destinationWarning && <div className='warning-msg'>Destination not found</div>}
                  <a className='location-form-button' onClick={this.handleClickCancel}>Cancel</a>
                  <a className='location-form-button' onClick={this.handleAddStop}>AddStop</a>
                  <a className='location-form-button' onClick={this.handleSumitSearch}>Submit</a>
              </form>
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
