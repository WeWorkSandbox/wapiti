import * as React from 'react';
import {EndPoint} from './EndPoint';
  
interface EndPointsProps {
    paths: any;
    selectedServer: string;
    specType: string;
  };

export class EndPoints extends React.Component<EndPointsProps> {

  render() {
    return (<>
    {this.props.paths
    .map(
      path =>  (<><span/><EndPoint
        selectedServer={this.props.selectedServer}
        path={path}
        specType={this.props.specType}
      > </EndPoint>
      </>)
    )}
  </>)
  }

}
