import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { Props as FlatpickrProps } from './Flatpickr';

jest.mock('./Flatpickr', () => ({ dueDate, setDueDate }: FlatpickrProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setDueDate(dateStr);
  };
  return (
    <input value={dueDate} onChange={onChange} data-testid="input-due-date" />
  );
});

// テストパターン
// 1-1. 『ToDoを入力』と『締切』が記入された状態で、追加ボタン押下すると、未完了に記入される
// 1-2. 『ToDoを入力』だけが記入された状態で、追加ボタン押下した場合、未完了に記入されない
// 1-3. 『締切』だけが記入された状態で、追加ボタン押下した場合、未完了に記入されない
// 1-4. 『ToDoを入力』と『締切』の両方が記入されていない状態で、追加ボタン押下した場合、未完了に記入されない
// 2-1. ToDoを編集ボタン押下時、ウィンドウが出てきて編集できる
// 2-2. ToDoを編集ボタン押下時、ウィンドウが出てきて編集しなかった場合、元のToDoを返す
// 3-1. 締切を編集ボタン押下時、ウィンドウが出てきて編集できる
// 3-2. 締切を編集ボタン押下時、ウィンドウが出てきて編集しなかった場合、元の締切を返す
// 4-1. 未完了のToDoにある、完了ボタン押下時、完了済みのToDoに記入される
// 4-2. 未完了のToDoにある、削除ボタン押下時、削除済みのToDoに記入される
// 5−1. 完了済みのToDoにある未完了へ戻すボタン押下時、未完了のToDoに記入される
// 5-2. 完了済みのToDoにある削除ボタン押下時、削除済みのToDoに記入される
// 6-1. 削除済みのToDoにある、完了へ戻すボタン押下時、完了済みのToDoに記入される
// 6-2. 削除済みのToDoにある、未完了へ戻すボタン押下時、未完了のToDoに記入される
// 6-3. 削除済みのToDoにある、完全に削除ボタン押下時、画面から完全に削除される

it('1-1. 『ToDoを入力』と『締切』が記入された状態で、追加ボタン押下すると、未完了に記入される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  expect(inputTask).toHaveAttribute('value', 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-01-06');
  expect(inputDueDate).toHaveAttribute('value', '2023-01-06');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(screen.getByText(/2023-01-06/)).toBeInTheDocument();
  expect(screen.getByTestId('unfinished-task')).toBeInTheDocument();
  expect(screen.queryByTestId('finished-task')).not.toBeInTheDocument();
  expect(screen.queryByTestId('delete-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('1-2. 『ToDoを入力』だけが記入された状態で、追加ボタン押下した場合、未完了に記入されない', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'いいい');
  expect(inputTask).toHaveAttribute('value', 'いいい');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  expect(screen.queryByTestId('incomplete-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('1-3. 『締切』だけが記入された状態で、追加ボタン押下した場合、未完了に記入されない', () => {
  const view = render(<App />);
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-01-27');
  expect(inputDueDate).toHaveAttribute('value', '2023-01-27');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  expect(screen.queryByTestId('unfinished-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('1-4.『ToDoを入力』と『締切』の両方が記入されていない状態で、追加ボタン押下した場合、未完了に記入されない', () => {
  const view = render(<App />);
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  expect(screen.queryByTestId('unfinished-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('2-1. ToDoを編集ボタン押下時、ウィンドウが出てきて編集できる', () => {
  const originalPrompt = window.prompt;
  const mockPrompt = jest.fn((_message = '', _default = '') => 'ううう');
  window.prompt = mockPrompt;
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-01-06');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onTaskEditButton = screen.getByTestId('task-edit-btn');
  userEvent.click(onTaskEditButton);
  expect(mockPrompt).toHaveBeenCalledWith('ToDoを編集してください', 'あああ');
  expect(screen.queryByText(/あああ/)).not.toBeInTheDocument();
  expect(screen.getByText(/ううう/)).toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
  window.prompt = originalPrompt;
});

it('2-2. ToDoを編集ボタン押下時、ウィンドウが出てきて編集しなかった場合、元のToDoを返す', () => {
  const originalPrompt = window.prompt;
  const mockPrompt = jest.fn((_message = '', _default = '') => null);
  window.prompt = mockPrompt;
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-01-06');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onTaskEditButton = screen.getByTestId('task-edit-btn');
  userEvent.click(onTaskEditButton);
  expect(mockPrompt).toHaveBeenCalledWith('ToDoを編集してください', 'あああ');
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
  window.prompt = originalPrompt;
});

it('3-1. 締切を編集ボタン押下時、ウィンドウが出てきて編集できる', () => {
  const originalPrompt = window.prompt;
  const mockPrompt = jest.fn((_message = '', _default = '') => '2023-02-02');
  window.prompt = mockPrompt;
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-01-06');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onDueDateEditButton = screen.getByTestId('due-date-edit-btn');
  userEvent.click(onDueDateEditButton);
  expect(mockPrompt).toHaveBeenCalledWith(
    '締切を編集してください',
    '2023-01-06'
  );
  expect(screen.queryByText(/2023-01-06/)).not.toBeInTheDocument();
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
  window.prompt = originalPrompt;
});

it('3-2. 締切を編集ボタン押下時、ウィンドウが出てきて編集しなかった場合、元の締切を返す', () => {
  const originalPrompt = window.prompt;
  const mockPrompt = jest.fn((_message = '', _default = '') => null);
  window.prompt = mockPrompt;
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onDueDateEditButton = screen.getByTestId('due-date-edit-btn');
  userEvent.click(onDueDateEditButton);
  expect(mockPrompt).toHaveBeenCalledWith(
    '締切を編集してください',
    '2023-02-02'
  );
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
  window.prompt = originalPrompt;
});

it('4-1. 未完了のToDoにある、完了ボタン押下時、完了済みのToDoに記入される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onCompleteButton = screen.getByTestId('finished-btn-from-unfinished');
  userEvent.click(onCompleteButton);
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(screen.queryByTestId('unfinished-task')).not.toBeInTheDocument();
  expect(screen.getByTestId('finished-task')).toBeInTheDocument();
  expect(screen.queryByTestId('delete-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('4-2. 未完了のToDoにある、削除ボタン押下時、削除済みのToDoに記入される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onDeleteButton = screen.getByTestId('delete-btn-from-unfinished');
  userEvent.click(onDeleteButton);
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(screen.queryByTestId('unfinished-task')).not.toBeInTheDocument();
  expect(screen.queryByTestId('finished-task')).not.toBeInTheDocument();
  expect(screen.getByTestId('delete-task')).toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('5−1. 完了済みのToDoにある未完了へ戻すボタン押下時、未完了のToDoに記入される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onCompleteButton = screen.getByTestId('finished-btn-from-unfinished');
  userEvent.click(onCompleteButton);
  const onIncompleteButton = screen.getByTestId('unfinished-btn-from-finished');
  userEvent.click(onIncompleteButton);
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(screen.getByTestId('unfinished-task')).toBeInTheDocument();
  expect(screen.queryByTestId('finished-task')).not.toBeInTheDocument();
  expect(screen.queryByTestId('delete-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('5-2. 完了済みのToDoにある削除ボタン押下時、削除済みのToDoに記入される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onCompleteButton = screen.getByTestId('finished-btn-from-unfinished');
  userEvent.click(onCompleteButton);
  const onDeleteButton = screen.getByTestId('delete-btn-from-finished');
  userEvent.click(onDeleteButton);
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(screen.queryByTestId('unfinished-task')).not.toBeInTheDocument();
  expect(screen.queryByTestId('finished-task')).not.toBeInTheDocument();
  expect(screen.getByTestId('delete-task')).toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('6-1. 削除済みのToDoにある、完了へ戻すボタン押下時、完了済みのToDoに記入される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onDeleteButton = screen.getByTestId('delete-btn-from-unfinished');
  userEvent.click(onDeleteButton);
  const onCompleteButton = screen.getByTestId('finished-btn-from-delete');
  userEvent.click(onCompleteButton);
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(screen.queryByTestId('unfinished-task')).not.toBeInTheDocument();
  expect(screen.getByTestId('finished-task')).toBeInTheDocument();
  expect(screen.queryByTestId('delete-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('6-2. 削除済みのToDoにある、未完了へ戻すボタン押下時、未完了のToDoに記入される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onDeleteButton = screen.getByTestId('delete-btn-from-unfinished');
  userEvent.click(onDeleteButton);
  const onIncompleteButton = screen.getByTestId('unfinished-btn-from-delete');
  userEvent.click(onIncompleteButton);
  expect(screen.getByText(/あああ/)).toBeInTheDocument();
  expect(screen.getByText(/2023-02-02/)).toBeInTheDocument();
  expect(screen.getByTestId('unfinished-task')).toBeInTheDocument();
  expect(screen.queryByTestId('finished-task')).not.toBeInTheDocument();
  expect(screen.queryByTestId('delete-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});

it('6-3. 削除済みのToDoにある、完全に削除ボタン押下時、画面から完全に削除される', () => {
  const view = render(<App />);
  const inputTask = screen.getByTestId('input-task');
  userEvent.type(inputTask, 'あああ');
  const inputDueDate = screen.getByTestId('input-due-date');
  userEvent.type(inputDueDate, '2023-02-02');
  const onAddButton = screen.getByTestId('add-btn');
  userEvent.click(onAddButton);
  const onDeleteButton = screen.getByTestId('delete-btn-from-unfinished');
  userEvent.click(onDeleteButton);
  const onCompleteDeleteButton = screen.getByTestId('complete-delete-btn');
  userEvent.click(onCompleteDeleteButton);
  expect(screen.queryByTestId('unfinished-task')).not.toBeInTheDocument();
  expect(screen.queryByTestId('finished-task')).not.toBeInTheDocument();
  expect(screen.queryByTestId('delete-task')).not.toBeInTheDocument();
  expect(view.asFragment()).toMatchSnapshot();
});
