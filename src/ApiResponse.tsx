import * as React from 'react';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';
import {schemaToModel, generateExample, removeCircularReferences} from './utils/common-utils.js';
import {JsonTree} from './JsonTree';
import {SchemaTree} from './SchemaTree';
import './ApiResponse.css'
  
interface ApiResponseProps {
    specType: string;
    responses: any;
};

interface ApiResponseState {
    exampleTabActive: boolean[];
};

export class ApiResponse extends React.Component<ApiResponseProps, ApiResponseState> {

  constructor(props: ApiResponseProps) {
    super(props);
    let eta = [];
    for(let statusCode in this.props.responses) {
      eta[statusCode] = true;
    }
    this.state = { exampleTabActive: eta };
  }

  render() {
    return (
    <div className="response col regular-font">
    <div className="title">RESPONSE</div>
    {this.responseTemplate()}
    </div>
   );
  }

  activateTab = (e) => {
    let id = e.target.id;
    let status = id.split('_')[0];
    let eta = this.state.exampleTabActive;
    eta[status] = id.endsWith('_example'); 
    this.setState({ exampleTabActive: eta });
  }

  responseTemplate(){

    let selectedMimeValueForEachStatus={};
    let headersForEachRespStatus={};
    let mimeResponsesForEachStatus={};

    for(let statusCode in this.props.responses) {
      let allMimeResp={};
      if (this.props.specType === 'grpc') {
          let respSchemaTree =  this.props.responses[statusCode].resp.schema;
          allMimeResp['protobuf'] = {
            "examples"  : [],
            "schemaTree": respSchemaTree
          }
          allMimeResp['protobuf'].examples.push({exampleValue: this.props.responses[statusCode].resp.mock});
      }
      for(let mimeResp in this.props.responses[statusCode].content ) {
        let mimeRespObj = this.props.responses[statusCode].content[mimeResp];
        {/*Remove Circular references from Response schema*/}
        try {
          mimeRespObj.schema = JSON.parse(JSON.stringify(mimeRespObj.schema, removeCircularReferences(0)));
        }
        catch{
          console.error("Unable to resolve circular refs in schema", mimeRespObj.schema);
          return;
        }

        // Generate Schema
        let schemaTree = schemaToModel(mimeRespObj.schema,{});

        // Generate Example
        let respExample = generateExample(
          mimeRespObj.schema? mimeRespObj.schema.examples:'',
          mimeRespObj.schema? mimeRespObj.schema.example:'',
          mimeRespObj.schema,
          mimeResp,
          "json"
        );
        allMimeResp[mimeResp] = {
          "description":this.props.responses[statusCode].description,
          "examples"  : respExample,
          "schemaTree": schemaTree,
        }
        selectedMimeValueForEachStatus[statusCode]= mimeResp;
      }

      // Headers for each response status
      let tempHeaders:any[] = [];
      for (let key in this.props.responses[statusCode].headers){
        tempHeaders.push ( { "name":key, ...this.props.responses[statusCode].headers[key]} );
      }
      headersForEachRespStatus[statusCode]   = tempHeaders;
      mimeResponsesForEachStatus[statusCode] = allMimeResp;
    } 

    let styleActive = { flex: 1 }
    let styleNotActive = { flex: 1, display: 'none' }

    return (<>{Object.keys(this.props.responses).map(
      (status, index)  => (<>
      <div className="resp-head {index===0?'top-gap':'divider'}"><>
        {this.props.specType === 'grpc'? <span className="resp-status">{this.props.responses[status].resp.objType}</span>  : <span className="resp-status">{status}:</span>}
        <span className="resp-descr">{this.props.responses[status].description}</span>
        { (headersForEachRespStatus[status] && headersForEachRespStatus[status].length > 0)? (
          <><div style={{ padding: '12px 0 5px 0' }} className="resp-status">Response Headers:</div>
          <table style={{}}>
            {headersForEachRespStatus[status].map( v => (
              <tr>
                <td style={{ padding: '0 12px', verticalAlign: 'top' }} className="regular-font-size"> {v.name}</td>
                <td style={{ padding: '0 12px', verticalAlign: 'top', lineHeight: '14px' }} className="descr-text small-font-size">
                  <span className="m-markdown-small"><DangerousHTML html={marked(v.description)} /></span>
                  { (v.schema && v.schema.example)? (<><br/><span style={{ fontWeight: 'bold' }}>EXAMPLE:</span> {v.schema.example}</>):'' }
                </td>
              </tr>
            ))}
          </table>
         </>):''}
        </>
      </div>
      {Object.keys(mimeResponsesForEachStatus[status]).map(
        mimeType => mimeType.includes('octet-stream')? (<div> <span style={{ color: 'var(--primary-color)' }}> Content-Type: </span> {mimeType} (Binary Data) </div>): (
          <div className="tab-panel col" style={{ borderWidth: '0',  minHeight: '200px' }}>
            <div id={status+'_'+mimeType+'_tab-buttons'} onClick={ this.activateTab } className="tab-buttons row" >
              <button className={'tab-btn'+(this.state.exampleTabActive[status]?' active':'')} id={status+'_'+mimeType+'_example'}>EXAMPLE</button>
              <button className={'tab-btn'+(this.state.exampleTabActive[status]?'':' active')} id={status+'_'+mimeType+'_model'}>MODEL</button>
              <div style={{ flex:1 }}></div>
              <div style={{ alignSelf: 'center', fontSize: 'var(--small-font-size)' }}> {mimeType} </div>
            </div>
            <div id={status+'_'+mimeType+'_example'} className="tab-content col" style={this.state.exampleTabActive[status]?styleActive:styleNotActive}>
              <JsonTree data={mimeResponsesForEachStatus[status][mimeType].examples[0].exampleValue}></JsonTree>
            </div>
            <div id={status+'_'+mimeType+'_model'} className="tab-content col" style={this.state.exampleTabActive[status]?styleNotActive:styleActive}>
              <SchemaTree data={mimeResponsesForEachStatus[status][mimeType].schemaTree}></SchemaTree>
            </div>
          </div>)
      )}</>)
    )}</>)

  }
}
