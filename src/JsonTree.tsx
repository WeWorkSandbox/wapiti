import * as React from 'react';
import './JsonTree.css';

interface JsonTreeProps {
    data: any;
};
  
export class JsonTree extends React.Component<JsonTreeProps> {

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
      return (<>
      <div className={'left-bracket expanded ' +  (detailType==='array'?'array':'object')} onClick={this.toggleExpand} > {detailType==='array'?'[':'{'}</div>
        <div className="inside-bracket">
        {Object.keys(data).map(key =>
          (<div className="item"> {detailType==='pure_object'? key + ':':''} {this.generateTree(data[key])}</div>)
        )}
        </div>
      <div className="right-bracket">{detailType==='array'?']':'}'}</div>
      </>)
    }
    else{
      return typeof data==='string'? <span className={typeof data}> "{data}"</span> : <span className={typeof data}>{data}</span>;
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
