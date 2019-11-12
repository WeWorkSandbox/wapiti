import React, {Component} from 'react';
import cx from 'classnames';
import DangerousHTML from 'react-dangerous-html';
import marked from 'marked';
import {ProcessSpec,processGrpcSpec} from './utils/parse-utils.js';
import {EndPoints} from './EndPoints';

import stylef from './FontStyles.scss';
import style from './Wapiti.scss';

export class Wapiti extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  loadSpec(specUrl, specType) {
    let me = this;
    if (!specUrl){
      return;
    }

    this.setState({
      isLoading: true,
      selectedServer: ""
    });

    if (specType === 'rest') {
       ProcessSpec(specUrl).then(function(spec){
        me.setState({
          isLoading: false,
          resolvedSpec: spec
        });
        if (spec===undefined || spec === null){
          console.error('Unable to resolve the API spec. ');
          me.setState({
            isLoading: false,
            errorSpec: "Unable to resolve the REST API spec"
          });          
        }
      })
      .catch(function(err) {
        me.setState({
          isLoading: false,
          errorSpec: "Could not load the REST API spec"
        });
        console.error('Unable to resolve the API spec.. ' + err.message);
      });
    }
    else if (specType === 'grpc') {
      processGrpcSpec(specUrl).then(function(spec) {
        me.setState({
          isLoading: false,
          resolvedSpec: spec
        });
        if (spec===undefined || spec === null){
          console.error('Unable to resolve the GRPC API spec. ');
          me.setState({
            isLoading: false,
            errorSpec: "Unable to resolve the GRPC API spec"
          });
        }
      })
      .catch(function(err) {
        me.setState({
          isLoading: false,
          errorSpec: "Could not load the GRPC API spec"
        });
        console.error('Unable to resolve the GRPC spec : ' + err.message);
      });
    }
  }

  componentDidMount() {
    this.loadSpec(this.props.specUrl, this.props.specType);
  }

  render() {
    return (
      <div className={cx(style["body-container"],stylef["regular-font"])}>
        {this.state.isLoading && (<div style={{textAlign: 'center', margin: '16px'}}>Loading ... </div>)}
        {!this.state.isLoading && this.state.errorSpec && (<div style={{textAlign: 'center', margin: '16px'}}>{this.state.errorSpec} </div>)}
        {this.state.resolvedSpec && this.state.resolvedSpec.info && (
        <div className={cx(style["section-gap"])}>
          <div className={cx(stylef["title"])}>
            {this.state.resolvedSpec.info.title}
            {this.state.resolvedSpec.info.version && (
              <span style={{ fontSize: 'var(--small-font-size)', fontWeight: 'bold'  }}>
                {this.state.resolvedSpec.info.version}
              </span>
            )}
          </div>
          {this.state.resolvedSpec.info.description && (
              <div className={cx(stylef['m-markdown'], stylef["regular-font"])}><DangerousHTML html={marked(this.state.resolvedSpec.info.description)} /></div>
          )}
          </div>
        )}
        {/*TODO SCheme */}
        {this.state.resolvedSpec && this.state.resolvedSpec.tags && (
            <React.Fragment>
            {this.state.resolvedSpec.tags.map( tag => (
            <React.Fragment>
            <div className={cx(stylef["sub-title"],style["tag"],style["section-gap"],stylef["regular-font"])}>{tag.name}</div>
            <div style={{ margin:'4px 20px'}}>
              <div className={cx(stylef["m-markdown"],stylef["regular-font"])}>{tag.description?<DangerousHTML html={marked(tag.description)}/>:''}</div>
            </div>
            <EndPoints
              selectedServer  = "{this.state.selectedServer?this.state.selectedServer:''}"
              paths           = {tag.paths}
              specType        = {this.props.specType}
            ></EndPoints>
            </React.Fragment>
           ))}
           </React.Fragment>
        )}        
      </div>
    );
  }
}
