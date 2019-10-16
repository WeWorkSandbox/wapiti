import * as React from 'react';
import DangerousHTML from 'react-dangerous-html';
import marked from 'marked';
import {ProcessSpec, processGrpcSpec} from './utils/parse-utils.js';
import {EndPoints} from './EndPoints';

import './FontStyles.css'
import './InputStyles.css'
import './FlexStyles.css'
import './TableStyles.css'
import './Wapiti.css';

interface WapitiProps {
    specUrl: string;
    specType: string;
};

interface WapitiState {
    isLoading: boolean;
    resolvedSpec: any;
    selectedServer: string;
}

export default class Wapiti extends React.Component<WapitiProps, WapitiState> {

  constructor(props: WapitiProps) {
    super(props);
    this.state = { isLoading: false, resolvedSpec: undefined, selectedServer: '' };
  }

  loadSpec(specUrl: string, specType: string) {
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
        }
      })
      .catch(function(err) {
        me.setState({
          isLoading: false
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
          console.error('Unable to resolve the GRPC spec. ');
        }
      })
      .catch(function(err) {
        me.setState({
          isLoading: false
        });
        console.error('Unable to resolve the GRPC spec.. ' + err.message);
      });
    }
  }

  componentDidMount() {
    this.loadSpec(this.props.specUrl, this.props.specType);
  }

  render() {
    return (
      <div className="body-container regular-font">
        {/*<slot></slot>*/}
        {this.state.isLoading && (<div style={{textAlign: 'center', margin: '16px'}}>Loading ... </div>)}
        {this.state.resolvedSpec && this.state.resolvedSpec.info && (
        <div className="section-gap">
          <div className="title">
            {this.state.resolvedSpec.info.title}
            {this.state.resolvedSpec.info.version && (
              <span style={{ fontSize: 'var(--small-font-size)', fontWeight: 'bold'  }}>
                {this.state.resolvedSpec.info.version}
              </span>
            )}
          </div>
          {this.state.resolvedSpec.info.description && (
              <div className='m-markdown regular-font'><DangerousHTML html={marked(this.state.resolvedSpec.info.description)} /></div>
          )}
        </div>
        )}
        {/*TODO SCheme */}
        {this.state.resolvedSpec && this.state.resolvedSpec.tags && (
            <>
            {this.state.resolvedSpec.tags.map( tag => (
            <>
            <div className="sub-title tag regular-font section-gap">{tag.name}</div>
            <div style={{ margin:'4px 20px'}}>
              <div className='m-markdown regular-font'>{tag.description?<DangerousHTML html={marked(tag.description)}/>:''}</div>
            </div>
            <EndPoints
              selectedServer  = "{this.state.selectedServer?this.state.selectedServer:''}"
              paths           = {tag.paths}
              specType        = {this.props.specType}
            ></EndPoints>
            </>
           ))}
           </>
        )}
        {/*<slot name="footer"></slot>*/}
      </div> 
    );
  }
}
