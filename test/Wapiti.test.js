import React from 'react';
import {Wapiti} from '../build/wapiti.module';
import renderer from 'react-test-renderer';

describe('Wapiti', () => {
  const component = renderer.create(
    <Wapiti />
  );

  const componentNotFound = renderer.create(
    <Wapiti 
       specUrl="/notfound.yaml"
       specType="rest"
    />
  );

  let tree;

  it('should render correctly', () => {
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should put error message', () => {
    tree = componentNotFound.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
