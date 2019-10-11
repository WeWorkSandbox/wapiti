import * as React from 'react';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';
import {ApiRequest} from './ApiRequest';
import {ApiResponse} from './ApiResponse';
import './EndPoint.css'
  
interface EndPointProps {
    path: any;
    selectedServer: string;
    specType: string;
};

interface EndPointState {
    accept: string;
    expanded: boolean;
};

export class EndPoint extends React.Component<EndPointProps,EndPointState> {

  constructor(props: EndPointProps) {
    super(props);
    this.state = { accept: '', expanded: false };
  }

  toggleExpand = (e) => {
    if (this.state.expanded){
      this.setState({
        expanded: false,
        accept: ''
      });
    }
    else {
      let accept ='';
      for(let respStatus in this.props.path.responses){
        for(let acceptContentType in (this.props.path.responses[respStatus]["content"])){
          accept = accept + acceptContentType + ', '
        }
      }
      accept = accept.replace(/,\s*$/, ""); // remove trailing comma
      this.setState({expanded: true, accept: accept});
    }
  }

  render() {
    return (
    <div  className={'m-endpoint regular-font ' + this.props.path.method + (this.state.expanded?' expanded':' collapsed')}>
      <div onClick={ this.toggleExpand } className={'head ' + this.props.path.method +  (this.state.expanded?' expanded':' collapsed')}>
        <div className={'method ' + this.props.path.method} > {this.props.specType === 'rest' ? this.props.path.method : 'Method' } </div>
        <div className={'path ' + (this.props.path.deprecated?' deprecated':'')}> {this.props.path.path} </div>
        {this.props.path.deprecated && <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: 'orangered', margin: '2px 0 0 5px' }}> deprecated </span>}
        <div className="only-large-screen" style={{ minWidth: '60px', flex: '1' }}></div>
        <div className="m-markdown-small descr"> {this.props.path.summary?<DangerousHTML html={marked(this.props.path.summary)} /> : ''}</div>
      </div>

      {this.state.expanded && (
      <div className={'body ' + this.props.path.method}>
        {(this.props.path.summary || this.props.path.description) && (
          <div className="summary">
            <div className="m-markdown title"><DangerousHTML html={marked(this.props.path.summary)} /></div>
            {this.props.path.summary !== this.props.path.description && (
              <div className="m-markdown">
                {this.props.path.description?<DangerousHTML html={marked(this.props.path.description)} />:''}
              </div>
            )}
          </div>
        )}
        <div className='req-resp-container'>
          <ApiRequest
            specType = {this.props.specType}
            method = {this.props.specType === 'rest' ? this.props.path.method : 'post'}
            path = {this.props.path.path}
            selectedServer = {this.props.selectedServer}
            parameters = {this.props.path.parameters}
            requestBody = {this.props.path.requestBody}
            accept ={this.state.accept}
          ></ApiRequest>
          <ApiResponse
            responses={this.props.path.responses}
            specType={this.props.specType}
          ></ApiResponse>
        </div>
      </div>
      )}

    </div>
    )
  }

}
