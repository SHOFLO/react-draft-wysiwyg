/* @flow */

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import {
  colors as defaultColors,
  toggleCustomInlineStyle,
  getSelectionCustomInlineStyle
} from 'draftjs-utils';
import {
  Modifier,
  EditorState
} from 'draft-js';
import Option from '../Option';
import styles from './styles.css'; // eslint-disable-line no-unused-vars

export default class ColorPicker extends Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    editorState: PropTypes.object.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
  };

  state: Object = {
    currentColor: undefined,
    currentBgColor: undefined,
    showModal: false,
    currentStyle: 'color',
  };

  componentWillMount(): void {
    const { editorState, modalHandler } = this.props;
    if (editorState) {
      this.setState({
        currentColor: getSelectionCustomInlineStyle(editorState, ['COLOR']).COLOR,
        currentBgColor: getSelectionCustomInlineStyle(editorState, ['BGCOLOR']).BGCOLOR,
      });
    }
    modalHandler.registerCallBack(this.showHideModal);
  }

  componentWillReceiveProps(properties: Object): void {
    const newState = {};
    if (properties.editorState &&
      this.props.editorState !== properties.editorState) {
      newState.currentColor
        = getSelectionCustomInlineStyle(properties.editorState, ['COLOR']).COLOR;
      newState.currentBgColor
        = getSelectionCustomInlineStyle(properties.editorState, ['BGCOLOR']).BGCOLOR;
    }
    this.setState(newState);
  }

  componentWillUnmount(): void {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.showHideModal);
  }

  onOptionClick: Function = (): void => {
    this.signalShowModal = !this.state.showModal;
  };

  setCurrentStyleBgcolor: Function = (): void => {
    this.setState({
      currentStyle: 'bgcolor',
    });
  };

  setCurrentStyleColor: Function = (): void => {
    this.setState({
      currentStyle: 'color',
    });
  };

  showHideModal: Function = (): void => {
    this.setState({
      showModal: this.signalShowModal,
    });
    this.signalShowModal = false;
  }

  toggleColor: Function = (color: string): void => {

    const { editorState, onChange } = this.props;
    const { currentStyle } = this.state;

    const currentInlineStyles = editorState.getCurrentInlineStyle();

    let contentState = editorState.getCurrentContent();

    currentInlineStyles.forEach((style) => {
      if (style.startsWith(currentStyle)) {
        contentState = Modifier.removeInlineStyle(
          contentState,
          editorState.getSelection(),
          style
        );
      }
    });

    const newEditorState = EditorState.push(editorState, contentState, 'change-inline-style');

    const newState = toggleCustomInlineStyle(
      newEditorState,
      currentStyle,
      `${currentStyle}-${color}`
    );

    if (newState) {
      onChange(newState);
    }
  };

  stopPropagation: Function = (event: Object): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  renderModal: Function = (): Object => {
    const { config: { popupClassName, colors } } = this.props;
    const { currentColor, currentBgColor, currentStyle } = this.state;
    const currentSelectedColor = (currentStyle === 'color') ? currentColor : currentBgColor;
    return (
      <div
        className={classNames('rdw-colorpicker-modal', popupClassName)}
        onClick={this.stopPropagation}
      >
        <span className="rdw-colorpicker-modal-header">
          <span
            className={classNames(
              'rdw-colorpicker-modal-style-label',
              { 'rdw-colorpicker-modal-style-label-active': currentStyle === 'color' }
            )}
            onClick={this.setCurrentStyleColor}
          >
            Text
          </span>
          <span
            className={classNames(
              'rdw-colorpicker-modal-style-label',
              { 'rdw-colorpicker-modal-style-label-active': currentStyle === 'bgcolor' }
            )}
            onClick={this.setCurrentStyleBgcolor}
          >
            Highlight
          </span>
        </span>
        <ColorPickerModalOptions
          colors={colors}
          currentSelectedColor={currentSelectedColor}
          currentStyle={currentStyle}
          onClick={this.toggleColor}
        />
        <ClearColorOption
          onClick={this.toggleColor}
        />
      </div>
    );
  };

  render(): Object {
    const { config: { icon, className } } = this.props;
    const { showModal } = this.state;
    return (
      <div
        className="rdw-colorpicker-wrapper"
        aria-haspopup="true"
        aria-expanded={showModal}
        aria-label="rdw-color-picker"
      >
        <Option
          onClick={this.onOptionClick}
          className={classNames(className)}
        >
          <img
            src={icon}
            role="presentation"
          />
        </Option>
        {showModal ? this.renderModal() : undefined}
      </div>
    );
  }
}

const ColorPickerModalOptions = ({colors, currentSelectedColor, currentStyle, onClick}) => {
  let optionNodes =
    defaultColors.map((rgb, index) => {
      return (
        <ColorPickerModalOption
          value={rgb}
          key={index}
          active={currentSelectedColor === `${currentStyle}-${rgb}`}
          onClick={onClick}
        />
      )
    })

  if (colors) {

    optionNodes = [];

    for (var color in colors) {
      const rgb = colors[color];
      optionNodes.push(
        <ColorPickerModalOption
          rgb={rgb}
          value={color}
          key={color}
          active={currentSelectedColor === `${currentStyle}-${color}`}
          onClick={onClick}
        />
      )
    }

  }

  return (<span className="rdw-colorpicker-modal-options">{optionNodes}</span>)

}

const ColorPickerModalOption = ({rgb, value, active, onClick}) => {

  return (
    <Option
      value={value}
      key={`color-picker-option-${value}`}
      className="rdw-colorpicker-option"
      activeClassName="rdw-colorpicker-option-active"
      active={active}
      onClick={onClick}
    >
      <span
        style={{ backgroundColor: rgb }}
        className="rdw-colorpicker-cube"
      />
    </Option>

  );

};

const ClearColorOption = ({onClick}) => {

  return (
    <Option
      value="inherit"
      key="color-picker-option-inherit"
      onClick={onClick}
    >
      <span>
        Clear
      </span>

    </Option>
  );
};
