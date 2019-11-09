import React, {Component} from 'react';
import cx from 'classnames';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';
import {schemaToModel, generateExample, removeCircularReferences} from './utils/common-utils.js';
import {JsonTree} from './JsonTree';
import {SchemaTree} from './SchemaTree';

import style from './ApiResponse.scss';
import stylee from './EndPoint.scss';
import stylefo from './FontStyles.scss';
import stylett from './TabStyles.scss';
import stylef from './FlexStyles.scss';

export class ApiResponse extends Component {

  constructor(props) {
    super(props);
    let eta = [];
    for(let statusCode in this.props.responses) {
      eta[statusCode] = true;
    }
    this.state = { exampleTabActive: eta };
  }

  render() {
    return (
    <div className={cx(stylee["response"],stylef["col"], stylefo["regular-font"])}>
    <div className={cx(style["title"])}>RESPONSE</div>
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
        catch (err) {
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
      let tempHeaders = [];
      for (let key in this.props.responses[statusCode].headers){
        tempHeaders.push ( { "name":key, ...this.props.responses[statusCode].headers[key]} );
      }
      headersForEachRespStatus[statusCode]   = tempHeaders;
      mimeResponsesForEachStatus[statusCode] = allMimeResp;
    } 

    let styleActive = { flex: 1 }
    let styleNotActive = { flex: 1, display: 'none' }

    return (<React.Fragment>{Object.keys(this.props.responses).map(
      (status, index)  => (<React.Fragment>
      <div className={cx(style["resp-head"], style[(index===0?'top-gap':'divider')])}><React.Fragment>
        {this.props.specType === 'grpc'? <span className={cx(style["resp-status"])}>{this.props.responses[status].resp.objType}</span>  : <span className="resp-status">{status}:</span>}
        <span className={cx(style["resp-descr"])}>{this.props.responses[status].description}</span>
        { (headersForEachRespStatus[status] && headersForEachRespStatus[status].length > 0)? (
          <React.Fragment><div style={{ padding: '12px 0 5px 0' }} className={cx(style["resp-status"])}>Response Headers:</div>
          <table style={{}}>
            {headersForEachRespStatus[status].map( v => (
              <tr>
                <td style={{ padding: '0 12px', verticalAlign: 'top' }} className={cx(stylefo["regular-font-size"])}> {v.name}</td>
                <td style={{ padding: '0 12px', verticalAlign: 'top', lineHeight: '14px' }} className={cx(style["descr-text"],stylefo["small-font-size"])}>
                  <span className={cx(stylefo["m-markdown-small"])}><DangerousHTML html={marked(v.description)} /></span>
                  { (v.schema && v.schema.example)? (<div><br/><span style={{ fontWeight: 'bold' }}>EXAMPLE:</span> {v.schema.example}</div>):'' }
                </td>
              </tr>
            ))}
          </table>
         </React.Fragment>):''}
        </React.Fragment>
      </div>
      {Object.keys(mimeResponsesForEachStatus[status]).map(
        mimeType => mimeType.includes('octet-stream')? (<React.Fragment> <span style={{ color: 'var(--primary-color)' }}> Content-Type: </span> {mimeType} (Binary Data) </React.Fragment>): (
          <div className={cx(stylett["tab-panel"], stylef["col"])} style={{ borderWidth: '0',  minHeight: '200px' }}>
            <div id={status+'_'+mimeType+'_tab-buttons'} onClick={ this.activateTab } className={cx(stylett["tab-buttons"],stylef["row"])} >
              <button className={cx(style['tab-btn'],style[(this.state.exampleTabActive[status]?'active':'')])} id={status+'_'+mimeType+'_example'}>EXAMPLE</button>
              <button className={cx(style['tab-btn'],style[(this.state.exampleTabActive[status]?'':'active')])} id={status+'_'+mimeType+'_model'}>MODEL</button>
              <div style={{ flex:1 }}></div>
              <div style={{ alignSelf: 'center', fontSize: 'var(--small-font-size)' }}> {mimeType} </div>
            </div>
            <div id={status+'_'+mimeType+'_example'} className={cx(stylett["tab-content"], stylef["col"])} style={this.state.exampleTabActive[status]?styleActive:styleNotActive}>
              <JsonTree data={mimeResponsesForEachStatus[status][mimeType].examples[0].exampleValue}></JsonTree>
            </div>
            <div id={status+'_'+mimeType+'_model'} className={cx(stylett["tab-content"], stylef["col"])} style={this.state.exampleTabActive[status]?styleNotActive:styleActive}>
              <SchemaTree data={mimeResponsesForEachStatus[status][mimeType].schemaTree}></SchemaTree>
            </div>
          </div>)
      )}</React.Fragment>)
    )}</React.Fragment>)

  }
}
