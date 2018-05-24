export const updateStartLocation = (address,lat,lng) => {
  return {
     type:'UPDATE_START_LOCATION',
     address:address,
     lat:lat,
     lng:lng
  };
}

export const updatDestinationLocation = (address,lat,lng) => {
    return {
       type:'UPDATE_DESTINATION_LOCATION',
       address:address,
       lat:lat,
       lng:lng
    };
}
