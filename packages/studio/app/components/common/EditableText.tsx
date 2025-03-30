import React, { useState } from 'react';
import { Input } from '../ui/input';

interface EditableTextProps {
  text: string;
  onSubmit: (text: string) => void | Promise<void>;
}
export const EditableText: React.FC<EditableTextProps> = React.memo((props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(props.text);

  if (!isEditing) {
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    return <div onClick={() => setIsEditing(true)}>{props.text}</div>;
  }

  return (
    <Input
      value={editingText}
      onChange={(e) => setEditingText(e.target.value)}
      onBlur={async () => {
        await props.onSubmit(editingText);
        setIsEditing(false);
      }}
    />
  );
});
EditableText.displayName = 'EditableText';
