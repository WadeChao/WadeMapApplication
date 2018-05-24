import axios from 'axios';

export default (method, url, options) =>
  axios({
    method,
    url,
    ...options,
  })
  .then(response => ({
    status: response.status,
    data: response.data,
    headers: response.headers,
  }))
  .catch(error => ({
    status: error.response.status,
    data: error.response.data,
  }));
