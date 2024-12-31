import React, { JSX } from 'react';
import { Modal as ModalAntd, Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  content?: string;
  footer: boolean;
  contentCustom?: () => JSX.Element;
}

const { Title } = Typography;

const Modal: React.FC<ConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title,
  content,
  footer,
  contentCustom = () => null,
}) => {
  const { t } = useTranslation();
  return (
    <ModalAntd
      visible={visible}
      title={title ? title : contentCustom?.() ? '' : 'Are you sure?'}
      onCancel={onCancel}
      footer={
        footer && [
          <Button key="cancel" onClick={onCancel}>
            {t('No')}
          </Button>,
          <Button key="confirm" type="primary" onClick={onConfirm}>
            {t('Yes')}
          </Button>,
        ]
      }
    >
      {content ? <Typography.Text>{content}</Typography.Text> : contentCustom?.()}
    </ModalAntd>
  );
};

export default Modal;
