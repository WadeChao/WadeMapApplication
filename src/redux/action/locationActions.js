export const updateStartLocation = (address,lat,lng) => {
  return {
     type:'UPDATE_START_LOCATION',
     address:address,
     lat:lat,
     lng:lng
  };
}

export const addRoutOffStops = (routeOffStops) => {
    return {
       type:'ADD_ROUTE_OFF_STOPS',
       routeOffStops:routeOffStops
    };
}
