import React from 'react';
import {ApiRequest} from '../build/wapiti.module';
import renderer from 'react-test-renderer';

describe('ApiRequest', () => {

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

  const componentGET = renderer.create(
    <ApiRequest
      accept=""
      method="GET"
      parameters={theParams}
      path="/test"
      selectedServer=""
      specType="rest"
    ></ApiRequest>
  );

  const componentPOST = renderer.create(<ApiRequest
    accept=""
    method="POST"
    requestBody={theBody}
    path="/test"
    selectedServer=""
    specType="rest"
  >></ApiRequest>
  );

  let tree;

  it('renders with rest GET', () => {
    tree = componentGET.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with rest POST', () => {
    tree = componentPOST.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
