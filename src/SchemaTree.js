import React, {Component, Fragment} from 'react';
import cx from 'classnames';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';

import style from './SchemaTree.scss';
import stylefo from './FontStyles.scss';

export class SchemaTree extends Component {

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
      if ((Object.keys(data).length===1) && Object.keys(data)[0]===':description' ){
        return (<React.Fragment>{'{ }'} <span className={cx(style['obj-descr'])}> {data[':description']} </span></React.Fragment>)
      }
      if (detailType==='array' && data[0]==='~|~' ){
        return ([ ])
      }
      return (
      <React.Fragment>
      <div className={cx(style['left-bracket'], 'expanded', (detailType==='array'?'array':'object'))} onClick={this.toggleExpand} > {detailType==='array'?`[`:'{'}</div>
      {data[':description']?(<span className={cx(style['obj-descr'], 'obj-content-part')}> {data[':description']} </span>):''}
      <div className={cx(style["inside-bracket"], "obj-content-part")} >
        <React.Fragment>
        {Object.keys(data).map(
          key => (<React.Fragment> 
            {key!==':description'? (<div className={cx(style["item"])}> <span className={cx(style["item-key"])}>
              {detailType==='pure_object'?key+':':''}
            </span>{this.generateTree(data[key])}</div>
            ):''}</React.Fragment>)
        )}
        </React.Fragment>
      </div>
      <div className={cx(style["right-bracket"], "obj-content-part")}>{detailType==='array'?']':'}'}</div>
      </React.Fragment>
      )
    }
    else if (typeof data === 'string'){
      return (<span className={cx(style["item-value"])}>
        {data ? data.split("~|~").map(
            (item,idx) => (<React.Fragment>
              {item ? (<div className={idx===0?cx(style['item-type'], style[item.substring(0,4)]):cx(stylefo['m-markdown-small'], style['item-descr'])}>
                {idx === 0 ? <DangerousHTML html={marked(item)} /> : <DangerousHTML html={marked(item)} />}
                </div>)
              :''}</React.Fragment>))
            :''}
      </span>)
    } else {
      return (<span className={cx(style["item-value"])}>{data}</span>)
    }

  }

  toggleExpand = (e) => {
    if (e.target.classList.contains("expanded")){
      e.target.classList.add("collapsed");
      e.target.classList.remove("expanded");
      e.target.innerHTML = e.target.classList.contains("array")? "[...]":"{...}";
      let els = e.target.parentNode.querySelectorAll(":scope > .obj-content-part")
      els.forEach( el => el.style.display='none');
    }
    else{
      e.target.classList.remove("collapsed");
      e.target.classList.add("expanded");
      e.target.innerHTML = e.target.classList.contains("array")? "[":"{";
      let els = e.target.parentNode.querySelectorAll(":scope > .obj-content-part");
      els.forEach( el =>  el.style.display=  el.classList.contains(cx(style["obj-descr"]))?'inline':'block');
    }
  }

}
