import React, {Component} from 'react';
import cx from 'classnames';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';
import {ApiRequest} from './ApiRequest';
import {ApiResponse} from './ApiResponse';

import style from './Endpoint.scss';
import stylef from './FontStyles.scss';

export class EndPoint extends Component {
  
  constructor(props) {
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
    <div  className={cx(style['m-endpoint'],stylef['regular-font'], style[this.props.path.method], style[(this.state.expanded?'expanded':'collapsed')])}>
      <div onClick={ this.toggleExpand } className={cx(style['head'],style[this.props.path.method],style[(this.state.expanded?'expanded':'collapsed')])}>
        <div className={cx(style['method'],style[this.props.path.method])} > {this.props.specType === 'rest' ? this.props.path.method : 'Method' } </div>
        <div className={cx(style['path'], style[this.props.path.deprecated?'deprecated':''])}> {this.props.path.path} </div>
        {this.props.path.deprecated && <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: 'orangered', margin: '2px 0 0 5px' }}> deprecated </span>}
        <div className={cx(style["only-large-screen"])} style={{ minWidth: '60px', flex: '1' }}></div>
        <div className={cx(style["m-markdown-small"],style["descr"])}> {this.props.path.summary?<DangerousHTML html={marked(this.props.path.summary)} /> : ''}</div>
      </div>

      {this.state.expanded && (
      <div className={cx(style['body'],style[this.props.path.method])}>
        {(this.props.path.summary || this.props.path.description) && (
          <div className={cx(style["summary"])}>
            <div className={cx(style["m-markdown"], style["title"])}><DangerousHTML html={marked(this.props.path.summary)} /></div>
            {this.props.path.summary !== this.props.path.description && (
              <div className={cx(style["m-markdown"])}>
                {this.props.path.description?<DangerousHTML html={marked(this.props.path.description)} />:''}
              </div>
            )}
          </div>
        )}
        <div className={cx(style["req-resp-container"])}>
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
