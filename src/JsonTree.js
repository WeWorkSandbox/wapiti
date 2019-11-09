import React, {Component} from 'react';
import cx from 'classnames';

import style from './JsonTree.scss';

export class JsonTree extends Component {

  render() {
    return (
      <div className={cx(style["tree"])}>
        {this.generateTree(this.props.data)}
      </div>
    )
  }

  generateTree(data){
    if (data===null){
      return (<div className={cx(style["null"])} style={{ display: 'inline' }}>null</div>)
    }
    if (typeof data === 'object'){
      let detailType = Array.isArray(data)?"array":"pure_object";
      if (Object.keys(data).length===0){
        return Array.isArray(data)?'[ ]':'{ }'
      }
      return (<React.Fragment>
      <div className={cx(style['left-bracket'], 'expanded', (detailType==='array'?'array':'object'))} onClick={this.toggleExpand} > {detailType==='array'?'[':'{'}</div>
        <div className={cx(style["inside-bracket"])}>
        {Object.keys(data).map(key =>
          (<div className={cx(style["item"])}> {detailType==='pure_object'? key + ':':''} {this.generateTree(data[key])}</div>)
        )}
        </div>
      <div className={cx(style["right-bracket"])}>{detailType==='array'?']':'}'}</div>
      </React.Fragment>)
    }
    else{
      let to = typeof data;
      return to==='string'? <span className={typeof data}> "{data}"</span> : <span className={cx(style[{to}])}>{data}</span>;
    }

  }

  toggleExpand = (e) => {
    if (e.target.classList.contains("expanded")){
      e.target.classList.add("collapsed");
      e.target.classList.remove("expanded");
      e.target.innerHTML = e.target.classList.contains("array")? "[...]":"{...}";
      e.target.nextElementSibling.style.display = "none";
      e.target.nextElementSibling.nextElementSibling.style.display= "none";
    }
    else{
      e.target.classList.remove("collapsed");
      e.target.classList.add("expanded");
      e.target.innerHTML = e.target.classList.contains("array")? "[":"{";
      e.target.nextElementSibling.style.display = "block";
      e.target.nextElementSibling.nextElementSibling.style.display= "block";
    }

    //console.log(e.target.parentElement.querySelectorAll(":scope > .inside-bracket"));
  }

}
