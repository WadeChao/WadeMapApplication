import location from './locationReducers';

describe('Route data location', () => {
  test('should return the initial state', () => {
    expect(location(undefined, {})).toEqual({
      startLocation:{
        address:'',
        lat:0,
        lng:0
      },
      routeOffStops:[]
    });
  });

  test('should handle UPDATE_START_LOCATION', () => {
    expect(
      location(undefined, {
         type:'UPDATE_START_LOCATION',
         address:'Default location',
         lat:22.343612,
         lng:114.129935
      })
    ).toEqual({
      startLocation:{
        address:'Default location',
        lat:22.343612,
        lng:114.129935
      },
      routeOffStops:[]
    });
  });

  test('should handle ADD_ROUTE_OFF_STOPS', () => {
    const routeOffStops = [{address:'中環', lat:22.279991, lng:114.158798},
                           {address:'上環', lat:22.286394, lng:114.149138},
                           {address:'佐敦', lat:22.304861, lng:114.169202},
                           {address:'旺角', lat:22.320365, lng:114.169773}];
    expect(
      location(undefined, {
         type:'ADD_ROUTE_OFF_STOPS',
         routeOffStops:routeOffStops
      })
    ).toEqual({
      startLocation:{
        address:'',
        lat:0,
        lng:0
      },
      routeOffStops:routeOffStops
    });
  });
});
