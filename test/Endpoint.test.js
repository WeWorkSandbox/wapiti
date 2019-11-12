import React from 'react';
import {EndPoint} from '../build/wapiti.module';
import renderer from 'react-test-renderer';

describe('EndPoint', () => {

  const thePath = {"path":"/test","description":"description","method":"GET",summary:"summary",responses:{"200":{"test":"test"}},parameters:{"test":"test"}}
  
  const component = renderer.create(
     <EndPoint
        selectedServer  = ""
        path           = {thePath}
        specType        = "rest"
     ></EndPoint>
  );

  let tree;

  it('renders with rest', () => {
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
