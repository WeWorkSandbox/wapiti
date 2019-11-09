import React, {Component} from 'react';
import cx from 'classnames';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';
import {schemaToModel, getTypeInfo,  generateExample, removeCircularReferences} from './utils/common-utils.js';
import {TagInput} from './TagInput';
import {SchemaTree} from './SchemaTree';

import style from './ApiRequest.scss';
import stylee from './EndPoint.scss';
import stylefo from './FontStyles.scss';
import stylet from './TableStyles.scss';
import stylett from './TabStyles.scss';
import stylef from './FlexStyles.scss';
import stylei from './InputStyles.scss';

export class ApiRequest extends Component {

  constructor(props) {
    super(props);
    this.state = { exampleTabActive: true, mimeTypeSelected: 'none' };
  }

  render() {
    return (
    <div className={cx(stylee["request"],stylef["col"], stylefo["regular-font"], style["request-panel"])}>
      <div className={cx(style["title"])}>REQUEST</div>
      {this.inputParametersTemplate('path')}
      {this.inputParametersTemplate('query')}
      {this.requestBodyTemplate()}
      {this.inputParametersTemplate('header')}
      {this.inputParametersTemplate('cookie')}
    </div>
   );
  }

  inputParametersTemplate(paramType){
    let title ="";
    let filteredParams= this.props.parameters? this.props.parameters.filter( param => param.in === paramType ):[];
    if (filteredParams.length === 0 ){
      return "";
    }
    if (paramType==='path'){ title = "PATH PARAMETERS"}
    else if (paramType==='query'){ title = "QUERY-STRING PARAMETERS"}
    else if (paramType==='header'){ title = "REQUEST HEADERS"}
    else if (paramType==='cookie'){ title = "COOKIES"}


    const tableRows = [];
    for (const param of filteredParams) {
      if (!param.schema){
        continue;
      }
      let paramSchema = getTypeInfo(param.schema);
      if (paramSchema === undefined) return;
      let inputVal='';
      if (param.example){
        if (param.example==='0' || param.example === 0){
          inputVal='0'
        }
        else{
          inputVal = param.example;
        }
      }
      else{
         inputVal = paramSchema.default;
      }

      tableRows.push((<React.Fragment>
      <tr>
        <td style={{ minWidth: '100px'}}>
          <div className={cx(style["param-name"])}>
            {param.required && <span style={{ color: 'orangered' }}>*</span>}{param.name}
          </div>
          <div className={cx(style["param-type"])}>
          {paramSchema.type==='array' ? paramSchema.array
          : paramSchema.type + (paramSchema.format ? '\u00a0' + paramSchema.format : '')}
          </div>
        </td>
        <td style={{ minWidth: '100px'}}>
          {paramSchema.type === 'array' ? (
          <TagInput
            theClassName="request-param"
            theStyle={{ width: '100%', fontSize: 'calc(var(--small-) + 1px)', background: 'var(--input-bg)', lineHeight: '13px' }}
            dataPtype={paramType}
            dataPname={param.name}
            dataArray="true"
            placeholder="add-multiple\u23ce"
          ></TagInput>)
          :(<input type="text" spellCheck={false} style={{ width: '100%' }} className={cx(style["request-param"])}
            value={inputVal}/>)}
        </td>
        <td>
          <div className={cx(style["param-constraint"])}><div>
            {paramSchema.constrain && (<div>{paramSchema.constrain}<br/></div>)}
            {paramSchema.allowedValues && (<div>{paramSchema.allowedValues}</div>)}
          </div></div>
        </td>
      </tr>
      {param.description && (
        <tr>
          <td style={{ border: 'none' }}>

          </td>
          <td colSpan={2} style={{ border: 'none', marginTop: '0', padding: '0 5px' }}>
            <span className={cx(stylefo["m-markdown-small"])}><DangerousHTML html={marked(param.description)} /></span>
          </td>
        </tr>
        )}
       </React.Fragment>
      ))
    }

    return (<React.Fragment>
    <div className={cx(stylet["table-title"], style["top-gap"])}>{title}</div>
    <div style={{ display: 'block', overflowX: 'auto',  maxWidth: '100%' }}>
      <table className={cx(stylet["m-table"])} style={{ width: '100%', wordBreak: 'break-word' }}>
        {tableRows}
      </table>
    </div>
    </React.Fragment>
    )
  }

  activateTab = (e) => {
    this.setState({ exampleTabActive: e.target.id === 'tab_example', mimeTypeSelected: this.state.mimeTypeSelected });
  }

  onMimeTypeChange = (e) => {
    this.setState({ exampleTabActive: this.state.exampleTabActive, mimeTypeSelected: e.target.value });
  }

  requestBodyTemplate(){

    if(!this.props.requestBody){
      return '';
    }
    if (Object.keys(this.props.requestBody).length === 0){
      return '';
    }

    let mimeReqCount = 0;
    let shortMimeTypes = {};
    let bodyDescrHtml = this.props.requestBody.description? (<div className={stylefo["m-markdown"]}> <DangerousHTML html={marked(this.props.requestBody.description)} /></div>):'';
    let textareaExampleHtml = [];
    var formDataHtml;
    const formDataTableRows = [];
    let isFormDataPresent = false;
    let reqSchemaTree = "";

    let content = this.props.requestBody.content;

    for(let mimeReq in content ) {
      if (this.state.mimeTypeSelected === 'none') {
        this.setState({mimeTypeSelected: mimeReq, exampleTabActive: this.state.exampleTabActive })
      }
      // do not change shortMimeTypes values, they are referenced in other places
      if (mimeReq.includes('json')){shortMimeTypes[mimeReq]='json';}
      else if (mimeReq.includes('xml')){shortMimeTypes[mimeReq]='xml';}
      else if (mimeReq.includes('text/plain')){shortMimeTypes[mimeReq]='text';}
      else if (mimeReq.includes('form-urlencoded')){shortMimeTypes[mimeReq]='form-urlencoded';}
      else if (mimeReq.includes('multipart/form-data')){shortMimeTypes[mimeReq]='multipart-form-data';}

      let mimeReqObj = content[mimeReq];

      if (mimeReq.includes('json') || mimeReq.includes('xml') || mimeReq.includes('text/plain')){
        try {
          //Remove Circular references from RequestBody json-schema
          mimeReqObj.schema = JSON.parse(JSON.stringify(mimeReqObj.schema, removeCircularReferences()));
        }
        catch (err){
          console.error("Unable to resolve circular refs in schema", mimeReqObj.schema);
          return;
        }
        reqSchemaTree = schemaToModel(mimeReqObj.schema,{});
        let reqExample    = generateExample(
          mimeReqObj.schema? mimeReqObj.schema.examples:'',
          mimeReqObj.schema? mimeReqObj.schema.example:'',
          mimeReqObj.schema,
          mimeReq, "text"
        );
        textareaExampleHtml[mimeReq] = (<textarea
            className={cx(style['textarea'], stylei['textarea'], stylei['mono'], stylei['request-body-param'], shortMimeTypes[mimeReq])}
            spellCheck={false}
            style={{ resize: 'vertical', display: shortMimeTypes[mimeReq]==='json'?'block':'none' }}
            value={reqExample[0].exampleValue} />)
      }
      else if (mimeReq.includes('form') || mimeReq.includes('multipart-form')){
        isFormDataPresent = true;
        for (const fieldName in mimeReqObj.schema.properties)  {
          const fieldSchema = mimeReqObj.schema.properties[fieldName];
          const fieldType = fieldSchema.type;
          const arrayType = fieldSchema.type==='array'?fieldSchema.items.type:'';
          formDataTableRows.push((<div>
          <tr>
            <td style={{minWidth: '100px' }}>
              <div className={cx(style["param-name"])}>{fieldName}</div>
              <div className={cx(style["param-type"])}>
              {fieldType==='array' ? '{fieldType} of {arrayType}'
              : fieldType + (fieldSchema.format ? '\u00a0' + fieldSchema.format : '')}
              </div>
            </td>
            <td style={{ minWidth: '100px' }}>
              {fieldType === 'array'? (
              <TagInput 
                theClassName="request-form-param"
                theStyle={{ width: '100%', fontSize: 'calc(var(--title-font-size) + 1px)', background: 'var(--input-bg)', lineHeight: '13px' }}
                dataPtype={fieldType}
                dataPname={fieldName}
                dataArray="true"
                placeholder="add-multiple\u23ce"
              ></TagInput>)
              :(<input
                spellCheck={false}
                type="{fieldSchema.format==='binary'?'file':'text'}"
                style={{ width: '100%' }} className={cx(style["request-form-param"])}
                />
              )}

            </td>
            <td>
              <div className={cx(style["param-constraint"])}></div>
            </td>
          </tr>
          {fieldSchema.description?(
            <tr>
              <td style={{ border: 'none' }}></td>
              <td colSpan={2} style={{ border: 'none', marginTop:0, padding: '0 5px' }}>
                <span className={cx(stylec["m-markdown-small"])}><DangerousHTML html={marked(fieldSchema.description)} /></span>
              </td>
            </tr>):''}
           </div>
        ))
        }


        formDataHtml = (
        <form className={cx(style["{shortMimeTypes[mimeReq]}"])}> {/* onSubmit={{ event.preventDefault() }}> */}
          <table style={{ width: '100%' }} className={cx(stylet["m-table"])}>
            {formDataTableRows}
          </table>
        </form>);
      }
      mimeReqCount++;
    }

    let bodyTitle = "";
    if (this.props.specType === 'grpc') {
      bodyTitle = this.props.requestBody.objType
      textareaExampleHtml['protobuf'] = (<textarea
            className={cx(style['textarea'],stylei['textarea'],stylei["mono"], stylei["request-body-param"], "json")}
            spellCheck={false}
            style={{ resize: 'vertical', display: 'block' }}
            value={JSON.stringify(this.props.requestBody.mock, undefined, 2)} />)
      reqSchemaTree = this.props.requestBody.schema;
      shortMimeTypes['protobuf']={};
      if (this.state.mimeTypeSelected === 'none') {
        this.setState({mimeTypeSelected: 'protobuf', exampleTabActive: this.state.exampleTabActive })
      }
      mimeReqCount = 1;
    } else {
      bodyTitle = (isFormDataPresent?'FORM':'BODY') + ' DATA '+(this.props.requestBody.required?'(required)':'')
    }

    let styleExample=this.state.exampleTabActive?{ flex: 1 }:{ flex: 1, display: 'none' }
    let styleModel=this.state.exampleTabActive?{ flex: 1, display: 'none' }:{ flex: 1 }

    return (<React.Fragment>
      <div className={cx(stylet['table-title'], style['top-gap'], style[(isFormDataPresent?'form_data':'body_data')])}> {bodyTitle} </div>
      {bodyDescrHtml}
      {isFormDataPresent?({formDataHtml})
        :(
        <div className={cx(stylett["tab-panel"], stylef["col"])} style={{borderWidth: '0',  minHeight: '200px' }}>
          <div id="tab_buttons" className={cx(stylett["tab-buttons"], stylef["row"])} onClick={this.activateTab}>
            <button className={cx(style['tab-btn'], style[(this.state.exampleTabActive?'active':'')])} id="tab_example">EXAMPLE </button>
            <button className={cx(style['tab-btn'], style[(this.state.exampleTabActive?'':'active')])} id="tab_model">MODEL</button>
            <div style={{ flex:1 }}> </div>
            <div style={{ color: 'var(--light-fg)', alignSelf: 'center', fontSize: 'var(--small-font-size)', marginTop: '8px' }}>
              {mimeReqCount===1? Object.keys(shortMimeTypes)[0]
              : Object.keys(shortMimeTypes).map(k => (<div>
                  {shortMimeTypes[k]==='json'? (
                    <input type='radio' name='request_body_type' value={shortMimeTypes[k]} onChange={this.onMimeTypeChange} checked={true} style={{ margin: '0 0 0 8px'}} />
                  )
                  :(
                    <input type='radio' name='request_body_type' value={shortMimeTypes[k]} onChange={this.onMimeTypeChange} style={{margin: '0 0 0 8px'}} />
                  )}
                </div>))}
            </div>
          </div>
          <div id="tab_example" className={cx(stylett["tab-content"], stylef["col"])} style={styleExample} >
            {textareaExampleHtml[this.state.mimeTypeSelected]}
          </div>
          <div id="tab_model" className={cx(stylett["tab-content"], stylef["col"])} style={styleModel}>
            <SchemaTree data={reqSchemaTree}></SchemaTree>
          </div>
        </div>)
      }</React.Fragment>)


  }

}
