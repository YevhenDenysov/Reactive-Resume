import { get, isEmpty } from 'lodash';
import moment from 'moment';

export const getModalText = (isEditMode, type) => {
  return isEditMode ? `Edit ${type}` : `Add ${type}`;
};

export const safetyCheck = (section, path = 'items') => {
  return !!(section && section.visible === true && !isEmpty(section[path]));
};

export const handleKeyUp = (event, action) => {
  (event.which === 13 || event.which === 32) && action();
};

export const isFileImage = (file) => {
  const acceptedImageTypes = ['image/jpeg', 'image/png'];
  return file && acceptedImageTypes.includes(file.type);
};

export const formatDateRange = ({ startDate, endDate }) =>
  `${moment(startDate).format('MMMM Y')} — ${
    moment(endDate).isValid() ? moment(endDate).format('MMMM Y') : 'Present'
  }`;

export const getFieldProps = (formik, schema, name) => ({
  touched: get(formik, `touched.${name}`, false),
  error: get(formik, `errors.${name}`, ''),
  isRequired: get(schema, `fields.${name}._exclusive.required`),
  ...formik.getFieldProps(name),
});

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const move = (
  source,
  destination,
  droppableSource,
  droppableDestination,
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
