import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { ApiResponse } from '../ApiResponse';

const theResponses = {
  "200": {
      description: "description",
      content: {
        "application/json": {
           schema:{
             type: "object",
             required: ["id","name"],
             properties: {
               id: {
                 type: "integer",
                 format: "int64"
               },
               name: {
                 type: "string"
               },
               tag: {
                 type: "string"
               }
             }
           }
        }
      }
   }
}

describe('ApiResponse', () => {
  it('renders with rest', () => {
    let wrapper = shallow(<ApiResponse
        responses={theResponses}
        specType="rest"
      ></ApiResponse>
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

});
