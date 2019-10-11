import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { EndPoints } from '../EndPoints';

const thePath = [{"test1":"test1"},{"test2":"test2"}]
const theType = "rest"

describe('Endpoints', () => {
  it('renders with rest', () => {
    let wrapper = shallow(<EndPoints
              selectedServer  = ""
              paths           = {thePath}
              specType        = "rest"
            ></EndPoints>);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
