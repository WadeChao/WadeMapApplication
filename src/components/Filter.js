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
              <form className='location-form'>
                  <input  type='text'
                          className='location-form-input'
                          name='startAddress'
                          placeholder='Start'
                          value={this.state.startAddress}
                          onChange={this.handleStartAddressChanged}
                  />
                  {startWarning && <div className='warning-msg'>Start Location not found</div>}
                  <input  type="text"
                          className='location-form-input'
                          name='destinationAddress'
                          placeholder='Destination'
                          value={this.state.destinationAddress}
                          onChange={this.handleDestAddressChanged}
                  />
                  {destinationWarning && <div className='warning-msg'>Destination not found</div>}
                  <button className='location-form-button' onClick={this.handleClickCancel}>Cancel<i className="fa fa-caret-right" aria-hidden="true"></i></button>
                  <button className='location-form-button' onClick={this.handleSumitSearch}>Submit<i className="fa fa-caret-right" aria-hidden="true"></i></button>
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
