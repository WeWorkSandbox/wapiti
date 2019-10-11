import * as React from 'react';
import './TagInput.css';

interface TagInputProps {
    theClassName: string;
    theStyle: any;
    dataPtype: string;
    dataPname: string;
    dataArray: string;
    placeholder: string;
};
  
export class TagInput extends React.Component<TagInputProps> {

  render() {
    return (
    <div className={this.props.theClassName + ' tags'} style={this.props.theStyle} tabIndex={0} contentEditable={true}>
      <input type="text" className='editor' onPaste={this.afterPaste} onKeyDown={this.afterKeyDown} placeholder={this.props.placeholder} />
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
