import React, { Component } from 'react';
import Map from './Map';
import Filter from './Filter';

class Container extends Component{

  render(){
    return (
        <div className='wade-map-body'>
          <Filter />
          <Map />
        </div>
    );
  }

}

export default Container;
