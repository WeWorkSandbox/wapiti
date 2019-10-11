import * as React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { ApiRequest } from '../ApiRequest';

const theParams = [{
  name: "limit",
  in: "query",
  description: "How many items to return at one time (max 100)",
  required: "false",
  schema: {
     type: "integer",
     format: "int32"
  }
}]

const theBody = {
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

describe('ApiRequest', () => {
  it('renders with rest GET', () => {
    let wrapper = shallow(<ApiRequest
        accept=""
        method="GET"
        parameters={theParams}
        path="/test"
        selectedServer=""
        specType="rest"
      ></ApiRequest>
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
  it('renders with rest POST', () => {
    let wrapper = shallow(<ApiRequest
        accept=""
        method="POST"
        requestBody={theBody}
        path="/test"
        selectedServer=""
        specType="rest"
      >></ApiRequest>
    );
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });


});
