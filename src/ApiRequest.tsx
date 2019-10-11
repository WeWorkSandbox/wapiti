import * as React from 'react';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';
import { schemaToModel, getTypeInfo,  generateExample, removeCircularReferences} from './utils/common-utils.js';
import {TagInput} from './TagInput';
import {SchemaTree} from './SchemaTree';
import './CommonStyles.css'
import './ApiRequest.css'
  
interface ApiRequestProps {
    specType: string;
    selectedServer: string;
    method: string;
    path: string;
    parameters: any[];
    requestBody: any;
    accept: string;
};

interface ApiRequestState {
   exampleTabActive: boolean; 
   mimeTypeSelected: string;
};

export class ApiRequest extends React.Component<ApiRequestProps, ApiRequestState> {

  constructor(props: ApiRequestProps) {
    super(props);
    this.state = { exampleTabActive: true, mimeTypeSelected: 'none' };
  }

  render() {
    return (
    <div className="request col regular-font request-panel">
      <div className="title">REQUEST</div>
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


    const tableRows : any[] = [];
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

      tableRows.push((<>
      <tr>
        <td style={{ minWidth: '100px'}}>
          <div className="param-name">
            {param.required && <span style={{ color: 'orangered' }}>*</span>}{param.name}
          </div>
          <div className="param-type">
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
          :(<input type="text" spellCheck={false} style={{ width: '100%' }} className="request-param"
            value={inputVal}/>)}
        </td>
        <td>
          <div className="param-constraint"><>
            {paramSchema.constrain && (<>{paramSchema.constrain}<br/></>)}
            {paramSchema.allowedValues && (<>{paramSchema.allowedValues}</>)}
          </></div>
        </td>
      </tr>
      {param.description && (
        <tr>
          <td style={{ border: 'none' }}>

          </td>
          <td colSpan={2} style={{ border: 'none', marginTop: '0', padding: '0 5px' }}>
            <span className="m-markdown-small"><DangerousHTML html={marked(param.description)} /></span>
          </td>
        </tr>
        )}
       </>
      ))
    }

    return (<>
    <div className="table-title top-gap">{title}</div>
    <div style={{ display: 'block', overflowX: 'auto',  maxWidth: '100%' }}>
      <table className="m-table" style={{ width: '100%', wordBreak: 'break-word' }}>
        {tableRows}
      </table>
    </div>
    </>
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

    let mimeReqCount=0;
    let shortMimeTypes={};
    let bodyDescrHtml = this.props.requestBody.description? (<div className="m-markdown"> <DangerousHTML html={marked(this.props.requestBody.description)} /></div>):'';
    let textareaExampleHtml:any[] = [];
    var formDataHtml: any;
    const formDataTableRows: any[] = [];
    let isFormDataPresent   = false;
    let reqSchemaTree="";

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
        catch{
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
            className={'textarea mono request-body-param '+ shortMimeTypes[mimeReq]}
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
          formDataTableRows.push((<>
          <tr>
            <td style={{minWidth: '100px' }}>
              <div className="param-name">{fieldName}</div>
              <div className="param-type">
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
                style={{ width: '100%' }} className="request-form-param"
                />
              )}

            </td>
            <td>
              <div className="param-constraint"></div>
            </td>
          </tr>
          {fieldSchema.description?(
            <tr>
              <td style={{ border: 'none' }}></td>
              <td colSpan={2} style={{ border: 'none', marginTop:0, padding: '0 5px' }}>
                <span className="m-markdown-small"><DangerousHTML html={marked(fieldSchema.description)} /></span>
              </td>
            </tr>):''}
           </>
        ))
        }


        formDataHtml = (
        <form className="{shortMimeTypes[mimeReq]}"> {/* onSubmit={{ event.preventDefault() }}> */}
          <table style={{ width: '100%' }} className="m-table">
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
            className="textarea mono request-body-param json"
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

    return (<>
      <div className={'table-title top-gap ' + (isFormDataPresent?'form_data':'body_data')}> {bodyTitle} </div>
      {bodyDescrHtml}
      {isFormDataPresent?({formDataHtml})
        :(
        <div className="tab-panel col" style={{borderWidth: '0',  minHeight: '200px' }}>
          <div id="tab_buttons" className="tab-buttons row" onClick={this.activateTab}>
            <button className={'tab-btn'+(this.state.exampleTabActive?' active':'')} id="tab_example">EXAMPLE </button>
            <button className={'tab-btn'+(this.state.exampleTabActive?'':' active')} id="tab_model">MODEL</button>
            <div style={{ flex:1 }}> </div>
            <div style={{ color: 'var(--light-fg)', alignSelf: 'center', fontSize: 'var(--small-font-size)', marginTop: '8px' }}>
              {mimeReqCount===1? Object.keys(shortMimeTypes)[0]
              : Object.keys(shortMimeTypes).map(k => (<>
                  {shortMimeTypes[k]==='json'? (
                    <input type='radio' name='request_body_type' value={shortMimeTypes[k]} onChange={this.onMimeTypeChange} checked={true} style={{ margin: '0 0 0 8px'}} />
                  )
                  :(
                    <input type='radio' name='request_body_type' value={shortMimeTypes[k]} onChange={this.onMimeTypeChange} style={{margin: '0 0 0 8px'}} />
                  )}
                </>))}
            </div>
          </div>
          <div id="tab_example" className="tab-content col" style={styleExample} >
            {textareaExampleHtml[this.state.mimeTypeSelected]}
          </div>
          <div id="tab_model" className="tab-content col" style={styleModel}>
            <SchemaTree data={reqSchemaTree}></SchemaTree>
          </div>
        </div>)
      }</>)


  }

}
