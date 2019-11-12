import React from 'react';
import {ApiResponse} from '../build/wapiti.module';
import renderer from 'react-test-renderer';

describe('ApiResponse', () => {

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

  const component = renderer.create(
    <ApiResponse
        responses={theResponses}
        specType="rest"
     ></ApiResponse>
  );

  let tree;

  it('renders with rest', () => {
    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
