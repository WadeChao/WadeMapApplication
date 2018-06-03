import React from 'react';
import { Filter } from './Filter';
import renderer from 'react-test-renderer';

describe('Route data location', () => {
  it('renders Filter correctly', () => {
  const tree = renderer
    .create(<Filter />)
    .toJSON();
  expect(tree).toMatchSnapshot();
  });
});
