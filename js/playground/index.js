/* @flow */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import draftToHtml from 'draftjs-to-html'; // eslint-disable-line import/no-extraneous-dependencies
import draftToMarkdown from 'draftjs-to-markdown'; // eslint-disable-line import/no-extraneous-dependencies
import {
  convertFromHTML,
  convertToRaw,
  convertFromRaw,
  ContentState,
  EditorState,
} from 'draft-js';
import { Editor } from '../src';
import styles from './styles.css'; // eslint-disable-line no-unused-vars

class TestOption extends Component {
  render() {
    return <div>testing</div>;
  }
}

class TestOption2 extends Component {
  render() {
    return <div>resting</div>;
  }
}

const contentBlocks = convertFromHTML('<p><p>Lorem ipsum ' +
      'dolor sit amet, consectetur adipiscing elit. Mauris tortor felis, volutpat sit amet ' +
      'maximus nec, tempus auctor diam. Nunc odio elit,  ' +
      'commodo quis dolor in, sagittis scelerisque nibh. ' +
      'Suspendisse consequat, sapien sit amet pulvinar  ' +
      'tristique, augue ante dapibus nulla, eget gravida ' +
      'turpis est sit amet nulla. Vestibulum lacinia mollis  ' +
      'accumsan. Vivamus porta cursus libero vitae mattis. ' +
      'In gravida bibendum orci, id faucibus felis molestie ac.  ' +
      'Etiam vel elit cursus, scelerisque dui quis, auctor risus.</p><img src="http://i.imgur.com/aMtBIep.png" /></p>');

const contentState = ContentState.createFromBlockArray(contentBlocks);

// const rawContentState = convertToRaw(contentState);

const rawContentState = {
  "entityMap":{
    "0":{"type":"MENTION","mutability":"IMMUTABLE","data":{"text":"@abc","value":"abc","url":"href-abc"}},
    "1":{"type":"MENTION","mutability":"IMMUTABLE","data":{"text":"@abcd","value":"abcd","url":"href-abcd"}},
    "2":{"type":"IMAGE","mutability":"IMMUTABLE","data":{"src":"https://files.graphiq.com/stories/t4/The_16_Dogs_That_Won8217t_Make_You_Sneeze_2060_2848.jpg","height":"auto","width":"100%"}}
  },
  "blocks":[{
    "key":"3c8kv",
    "text": "@abc testing mentions saving opps @abcd ",
    "type":"unstyled",
    "depth":0,
    "inlineStyleRanges":[],
    "entityRanges":[
      {"offset":0,"length":4,"key":0},
      {"offset":34,"length":5,"key":1}
    ],
    "data":{}
  },
  {
    "key":"2ff34",
    "text": " ",
    "type":"atomic",
    "depth":0,
    "inlineStyleRanges":[],
    "entityRanges":[
      {"offset":0,"length":1,"key":2},
    ],
    "data":{}
  }]
};

class Playground extends Component {

  state: any = {
    editorContent: undefined,
    contentState: rawContentState,
    editorState: EditorState.createEmpty()
  };

  onEditorChange: Function = (editorContent) => {
    this.setState({
      editorContent,
    });
  };

  clearContent: Function = () => {
    this.setState({
      contentState: convertToRaw(ContentState.createFromText('')),
    });
  };

  onContentStateChange: Function = (contentState) => {
      this.setState({contentState})
  };

  onEditorStateChange: Function = (editorState) => {
    this.setState({
      editorState,
    });
  };

  imageUploadCallBack: Function = file => new Promise(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
        xhr.open('POST', 'https://api.imgur.com/3/image');
        xhr.setRequestHeader('Authorization', 'Client-ID 8d26ccd12712fca');
        const data = new FormData(); // eslint-disable-line no-undef
        data.append('image', file);
        xhr.send(data);
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        });
        xhr.addEventListener('error', () => {
          const error = JSON.parse(xhr.responseText);
          reject(error);
        });
      }
    );

  render() {
    const { editorContent, contentState, editorState } = this.state;
    return (
      <div className="playground-root">
        <div className="playground-label">
          Toolbar is alwasy <sup>visible</sup>
        </div>
        <button onClick={this.clearContent} tabIndex={0}>Force Editor State</button>
        <div className="playground-editorSection">
          <input tabIndex={0} />
          <div className="playground-editorWrapper">
            <Editor
              tabIndex={0}
              editorState={editorState}
              toolbarClassName="playground-toolbar"
              wrapperClassName="playground-wrapper"
              editorClassName="playground-editor"
              toolbar={{image: { uploadCallback: this.imageUploadCallBack }}}
              onEditorStateChange={this.onEditorStateChange}
              onContentStateChange={this.onEditorChange}
              placeholder="testing"
              spellCheck
              toolbarCustomButtons={[<TestOption />, <TestOption2 />]}
              onFocus={() => {console.log('focus')}}
              onBlur={() => {console.log('blur')}}
              onTab={() => {console.log('tab'); return true;}}
              mention={{
                separator: ' ',
                trigger: '@',
                caseSensitive: true,
                suggestions: [
                  { text: 'A', value: 'AB', url: 'href-a' },
                  { text: 'AB', value: 'ABC', url: 'href-ab' },
                  { text: 'ABC', value: 'ABCD', url: 'href-abc' },
                  { text: 'ABCD', value: 'ABCDDDD', url: 'href-abcd' },
                  { text: 'ABCDE', value: 'ABCDE', url: 'href-abcde' },
                  { text: 'ABCDEF', value: 'ABCDEF', url: 'href-abcdef' },
                  { text: 'ABCDEFG', value: 'ABCDEFG', url: 'href-abcdefg' },
                ],
              }}
              toolbar={{
                options: ['inline', 'fontSize', 'colorPicker', 'link'],
                colorPicker: { colors: {
                  pink: 'rgb(158,80,247)',
                  red: 'rgb(243,110,113)',
                  green: 'rgb(82,255,86)',
                  yellow: 'rgb(247,254,89)',
                  teal: 'rgb(93,208,217)',
                  brown: 'rgb(244,184,75)',
                  grey: 'rgb(222,222,222)',
                  black: 'rgb(0,0,0)',
                  white: 'rgb(255, 255, 255)'
                } },

              }}
            />
          </div>
          <input tabIndex={0} />
          <textarea
            className="playground-content no-focus"
            value={draftToHtml(editorContent, {})}
          />
          <textarea
            className="playground-content no-focus"
            value={draftToMarkdown(editorContent, {})}
          />
          <textarea
            className="playground-content no-focus"
            value={JSON.stringify(editorContent)}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Playground />, document.getElementById('app')); // eslint-disable-line no-undef


/**
const rawContentState = ;


toolbar={{
  inline: {
    inDropdown: true,
  },
  list: {
    inDropdown: true,
  },
  textAlign: {
    inDropdown: true,
  },
  link: {
    inDropdown: true,
  },
  image: {
    uploadCallback: this.imageUploadCallBack,
  },
  history: {
    inDropdown: true,
  },
}}*/
