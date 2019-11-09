import React, {Component} from 'react';
import {EndPoint} from './EndPoint';
  
export class EndPoints extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (<React.Fragment>
    {this.props.paths
    .map(
      path =>  (<React.Fragment><span/><EndPoint
        selectedServer={this.props.selectedServer}
        path={path}
        specType={this.props.specType}
      > </EndPoint>
      </React.Fragment>)
    )}
  </React.Fragment>)
  }

}
