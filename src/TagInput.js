import React, {Component} from 'react';
import cx from 'classnames';

import style from './TagInput.scss';
  
export class TagInput extends Component {

  render() {
    return (
    <div className={cx(style[this.props.theClassName], style['tags'])} style={this.props.theStyle} tabIndex={0} contentEditable={true}>
      <input type="text" className={cx(style['editor'])} onPaste={this.afterPaste} onKeyDown={this.afterKeyDown} placeholder={this.props.placeholder} />
    </div>)
  }

  afterPaste = (e) => {
    let pastedData = e.clipboardData.getData('Text');
  }

  afterKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
      let spanEl = document.createElement('span');
{/*      if (e.target.value.trim()!==''){
        spanEl.innerText = e.target.value;
        e.target.value='';
        spanEl.classList.add('tag');
        spanEl.setAttribute("contenteditable","false");
        this.shadowRoot.querySelector(".tags").insertBefore(spanEl, e.target);
      } */}
    }
    else if (e.keyCode === 8){
      if (e.target.selectionStart === 0 && e.target.previousSibling){
        e.target.previousSibling.remove();
      }
    }
  }

  getValues(){
    let vals = [];
    {/*let tags = this.shadowRoot.querySelectorAll(".tag");
    for(let tagEl of tags){
      vals.push(tagEl.innerText);
    }*/}
    return vals;
  }

}
