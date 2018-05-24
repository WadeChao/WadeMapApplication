const initialState = {
  startLocation:{
    address:'',
    lat:0,
    lng:0
  },
  destinationLocation:{
    address:'',
    lat:0,
    lng:0
  },
};

export default function numberTodos(state=initialState,action){
  switch(action.type){
    case 'UPDATE_START_LOCATION':
    return {
      ...state,
      startLocation:{address: action.address, lat: action.lat, lng: action.lng}
    }
    case 'UPDATE_DESTINATION_LOCATION':
    return {
      ...state,
      destinationLocation:{address: action.address, lat: action.lat, lng: action.lng}
    }
    default:
      return state;
  }
}
