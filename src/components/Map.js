import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Map extends Component{

  constructor(props){
    super(props);
    this.myMap;
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.state = {
      defaultLocation: {
        center:{lat: 22.343612, lng: 114.129935},
        zoom:13,
        mapTypeId:google.maps.MapTypeId.ROADMAP
      }
    }
  }

  componentDidMount(){
    const {
      defaultLocation
    } = this.state;
    this.myMap = new window.google.maps.Map(
      this.refs.map,defaultLocation
    );
    this.directionsDisplay.setMap(this.myMap);
  };

  componentWillReceiveProps(object){
    if(object.locReducer.startLocation.address === ''){
      this.clearMap();
    }
    else{
       this.moveToLocation(object.locReducer.startLocation.lat, object.locReducer.startLocation.lng);
    }
  }

  shouldComponentUpdate(nextProps, nextState){
    let isUpdate = (JSON.stringify(this.props.locReducer) === JSON.stringify(nextProps.locReducer)) ? false : true;
    if(nextProps.locReducer.destinationLocation.address === ''){
        this.clearRoute();
        isUpdate = false;
    }
    if(isUpdate){
      const start = nextProps.locReducer.startLocation.lat + ', ' +nextProps.locReducer.startLocation.lng;
      const end = nextProps.locReducer.destinationLocation.lat + ', ' +nextProps.locReducer.destinationLocation.lng;
      this.routeDirection(start, end);
    }
    return isUpdate;
  }

  routeDirection = (start, end) => {
   const request = {
     origin: start,
     destination: end,
     travelMode: 'DRIVING'
   };
   this.directionsService.route(request, (result, status) => {
    if(status === 'OK')
      this.directionsDisplay.setDirections(result);
    });
  }

  moveToLocation = (lat, lng) => {
     let center = new google.maps.LatLng(lat, lng);
     this.myMap.panTo(center);
 }

 clearRoute = () => {
   if (this.directionsDisplay !== null) {
    this.directionsDisplay.setMap(null);
    this.directionsDisplay = null;
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(this.myMap);
   }
 }

 clearMap = () => {
   const {
     defaultLocation
   } = this.state;
   this.clearRoute();
   this.moveToLocation(defaultLocation.center.lat, defaultLocation.center.lng);
 }

 render() {
  return <div className='map'>
      <div className='myMap' ref='map'/>
    </div>
 }
}

const mapStateToProps = ({ locReducer }) => ({
  locReducer
});

export default connect(mapStateToProps)(Map);
