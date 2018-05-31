const initialState = {
  startLocation:{
    address:'',
    lat:0,
    lng:0
  },
  routeOffStops:[]
};

export default function numberTodos(state=initialState,action){
  switch(action.type){
    case 'UPDATE_START_LOCATION':
    return {
      ...state,
      startLocation:{address: action.address, lat: action.lat, lng: action.lng}
    }
    case 'ADD_ROUTE_OFF_STOPS':
    return {
      ...state,
      routeOffStops:action.routeOffStops
    }
    default:
      return state;
  }
}
