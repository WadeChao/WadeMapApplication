import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateStartLocation } from '../redux/action/locationActions';
import { updatDestinationLocation } from '../redux/action/locationActions';
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
      isReadyGetDest:false,
      startWarning:false,
      destinationWarning:false
    }
  }

  componentDidMount(){
    const componentObject = this;
    let locationInputs = (document.getElementsByClassName('location-form-input'));
    Array.prototype.filter.call(locationInputs, function(input){
      let autoComplete = new google.maps.places.Autocomplete(input);
      autoComplete.addListener('place_changed', function() {
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
              if(input.name === 'destinationAddress'){
                componentObject.setState({
                  destinationAddress:place.name,
                  destinationCheck:true,
                  destinationWarning:false
                });
              }
              componentObject.handleSumitSearch();
            }
      });
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

  async postRoute(startLocation, destinationLocation){
    let data = [];
    data.push(startLocation);
    data.push(destinationLocation);
    const response = await mockAPIs.postRouteAPI(data);
    if(response.status === 200 || response.status === 201) {
    }
    else{
      console.log('Post route to Server error, please check your MockApi service is Running on localhost:8080')
    }
  }


  handlePlaceChanged = (autoComplete) => {
    let isNonEmpty = (event.target.value !== '') ? true : false;
    this.setState(
      {
        startAddress:event.target.value,
        startCheck:isNonEmpty,
        startWarning:false
      }
    );
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
      isReadyGetDest
    } = this.state;
    const {
      locReducer,
    } = this.props;
    if(isReadyGetStart && isReadyGetDest){
      const arrStart = [locReducer.startLocation.lat.toString(), locReducer.startLocation.lng.toString()];
      const arrDest = [locReducer.destinationLocation.lat.toString(), locReducer.destinationLocation.lng.toString()];
      this.postRoute(arrStart, arrDest);
    }
  }

  handleSumitSearch = (event) => {
    if(event !== undefined)
      event.preventDefault();
    const {
      startAddress,
      destinationAddress,
      startCheck,
      destinationCheck
    } = this.state;
    const {
      locReducer,
      updateStartLocation,
      updatDestinationLocation
    } = this.props;
    if(startCheck && locReducer.startLocation.address !== startAddress){
      this.getLocationInfo(startAddress).then((value) => {
        updateStartLocation(value.address,value.lat,value.lng);
        this.setState({isReadyGetStart:true});
      }).catch(error => {
        this.setState({isReadyGetStart:false, startWarning:true});
      });
    }

    if(startCheck && destinationCheck){
      this.getLocationInfo(destinationAddress).then((value) => {
        updatDestinationLocation(value.address,value.lat,value.lng);
        this.setState({isReadyGetDest:true});
      }).catch(error => {
        this.setState({isReadyGetDest:false, destinationWarning:true});
      });
    }
    else{
      updatDestinationLocation('', 0, 0);
    }
    this.handlePostRouteToServer();
  }

  handleKeyPress = (event) => {
    if(event.which === 13) {
      this.handleSumitSearch();
    }
  }

  handleClickCancel = (event) => {
    event.preventDefault();
    const {
      updateStartLocation,
      updatDestinationLocation
    } = this.props;
    this.setState({
      startAddress:'',
      destinationAddress:'',
      startCheck:false,
      destinationCheck:false,
      isReadyGetStart:false,
      isReadyGetDest:false,
      startWarning:false,
      destinationWarning:false
    });
    updateStartLocation('', 0, 0);
    updatDestinationLocation('', 0, 0);
  }

  render() {
    const {
      startAddress,
      destinationAddress,
      startWarning,
      destinationWarning
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
                  {startWarning && <div className='warning-msg'>Start Location not found</div>}
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
                  <button className='location-form-button' onClick={this.handleSumitSearch}>Submit</button>
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
    updatDestinationLocation:(address, lat, lng) => {
      dispatch(updatDestinationLocation(address, lat, lng));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
