import React from 'react';
import {EndPoints} from '../build/wapiti.module';
import renderer from 'react-test-renderer';

describe('EndPoints', () => {

  const thePath = [{"test1":"test1"},{"test2":"test2"}]

  const component = renderer.create(
     <EndPoints
        selectedServer  = ""
        paths           = {thePath}
        specType        = "rest"
     ></EndPoints>
  );

  let tree;

  it('renders with rest', () => {
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
