import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { EndPoint } from '../EndPoint';

const thePath = {"path":"/test","description":"description","method":"GET",summary:"summary",responses:{"200":{"test":"test"}},parameters:{"test":"test"}}
const theType = "rest"

describe('Endpoint', () => {
  it('renders with rest', () => {
    let wrapper = shallow(<EndPoint
              selectedServer  = ""
              path           = {thePath}
              specType        = "rest"
            ></EndPoint>);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
  it('renders with rest expanded', () => {
    let wrapper = shallow(<EndPoint
              selectedServer  = ""
              path           = {thePath}
              specType        = "rest"
            ></EndPoint>);
    wrapper.setState({ expanded: true });
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });


});
