import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { Wapiti } from '../Wapiti';

const theSpec = "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/yaml/petstore.yaml"
const theType = "rest"

describe('Wapiti', () => {
  it('renders with rest', () => {
    let wrapper = shallow(<Wapiti
          specUrl={theSpec}
          specType={theType}
        />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
