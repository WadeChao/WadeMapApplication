import { MOCK_API_DOMAIN } from './config';
import request from './request';

function postRouteAPI(options) {
  return request('POST', `${MOCK_API_DOMAIN}/route`,{
    ...options,
    params:{
    },
  });
}

export default {
  postRouteAPI
}
