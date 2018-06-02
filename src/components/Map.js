import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert, Button, Col } from 'react-bootstrap';

class Map extends Component{

  constructor(props){
    super(props);
    this.myMap;
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.state = {
      defaultLocation:{
        center:{lat: 22.343612, lng: 114.129935},
        zoom:13,
        mapTypeId:google.maps.MapTypeId.ROADMAP
      },
      routeDirectionWarning:false
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
    const {
      routeDirectionWarning
    } = this.state;
    let isUpdate = (JSON.stringify(this.props.locReducer) === JSON.stringify(nextProps.locReducer)) ? false : true;
    if(nextProps.locReducer.routeOffStops.length === 0){
        this.clearRoute();
        isUpdate = false;
    }
    if(isUpdate){
      const start = nextProps.locReducer.startLocation.lat + ', ' +nextProps.locReducer.startLocation.lng;
      const routeOffLength = nextProps.locReducer.routeOffStops.length;
      const destination = nextProps.locReducer.routeOffStops[routeOffLength-1].lat + ', ' +nextProps.locReducer.routeOffStops[routeOffLength-1].lng;
      let midStops = [];
      for(let i = 0; i<routeOffLength-1; i++){
        const stops = {
                  location: nextProps.locReducer.routeOffStops[i].lat + ', ' + nextProps.locReducer.routeOffStops[i].lng,
                  stopover: true
                }
        midStops.push(stops);
      }
      this.routeDirection(start, midStops, destination);
    }
    if(nextState.routeDirectionWarning !== routeDirectionWarning)
    {
      isUpdate = true;
    }
    return isUpdate;
  }

  handleDismissWarning = (event) => {
    event.preventDefault();
    this.setState({ routeDirectionWarning: false });
  }

  routeDirection = (start, midStops,destination) => {
    let mapObj = this;
    this.directionsService.route({
        origin: start,
        destination: destination,
        waypoints: midStops,
        optimizeWaypoints: false,
        travelMode: 'DRIVING'
      }, function(response, status) {
        if (status === 'OK') {
          mapObj.setState({ routeDirectionWarning: false });
          mapObj.directionsDisplay.setDirections(response);
          var route = response.routes[0];
        } else {
          mapObj.setState({routeDirectionWarning:true});
        }
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
   this.setState({routeDirectionWarning:false});
   this.moveToLocation(defaultLocation.center.lat, defaultLocation.center.lng);
 }

 render() {
   const {
     routeDirectionWarning
   } = this.state;
   return <div className='map'>
            <div className='myMap' ref='map'/>
            {routeDirectionWarning && <Alert bsStyle="danger" className='warning'>
                <div className='warning-info'>
                  <Col sm={12}>
                    <strong>Your direction is not allow</strong>
                  </Col>
                  <Col sm={12}>
                    <Button bsSize='small' onClick={this.handleDismissWarning}>Hide Alert</Button>
                  </Col>
                </div>
               </Alert>
            }
          </div>
 }
}

const mapStateToProps = ({ locReducer }) => ({
  locReducer
});

export default connect(mapStateToProps)(Map);
