import * as React from 'react';
import marked from 'marked';
import DangerousHTML from 'react-dangerous-html';

import './SchemaTree.css'

interface SchemaTreeProps {
    data: any;
};

export class SchemaTree extends React.Component<SchemaTreeProps> {

  render() {
    return (
      <div className="tree">
        {this.generateTree(this.props.data)}
      </div>
    )
  }

  generateTree(data){
    if (data===null){
      return (<div className="null" style={{ display: 'inline' }}>null</div>)
    }
    if (typeof data === 'object'){
      let detailType = Array.isArray(data)?"array":"pure_object";
      if (Object.keys(data).length===0){
        return Array.isArray(data)?'[ ]':'{ }'
      }
      if ((Object.keys(data).length===1) && Object.keys(data)[0]===':description' ){
        return (<>{'{ }'} <span className='obj-descr'> {data[':description']} </span></>)
      }
      if (detailType==='array' && data[0]==='~|~' ){
        return ([ ])
      }
      return (
      <>
      <div className={'left-bracket expanded ' + (detailType==='array'?'array':'object')} onClick={this.toggleExpand} > {detailType==='array'?`[`:'{'}</div>
      {data[':description']?(<span className='obj-descr obj-content-part'> {data[':description']} </span>):''}
      <div className="inside-bracket obj-content-part" >
        <>
        {Object.keys(data).map(
          key => (<> 
            {key!==':description'? (<div className="item"><> <span className="item-key">
              {detailType==='pure_object'?key+':':''}
            </span>{this.generateTree(data[key])}</></div>
            ):''}</>)
        )}
        </>
      </div>
      <div className="right-bracket obj-content-part">{detailType==='array'?']':'}'}</div>
      </>
      )
    }
    else if (typeof data === 'string'){
      return (<span className="item-value">
        {data ? data.split("~|~").map(
            (item,idx) => (<>
              {item ? (<div className={idx===0?'item-type ' + item.substring(0,4):'m-markdown-small item-descr'}>
                {idx === 0 ? <DangerousHTML html={marked(item)} /> : <DangerousHTML html={marked(item)} />}
                </div>)
              :''}</>))
            :''}
      </span>)
    } else {
      return (<span className="item-value">{data}</span>)
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
      els.forEach( el =>  el.style.display=  el.classList.contains("obj-descr")?'inline':'block');
    }
  }

}
