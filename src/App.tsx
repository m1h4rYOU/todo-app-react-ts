import React, { ChangeEvent, useState } from 'react';
import './App.css';
import DraggableList from './Draggable';
import AppFlatpickr from './Flatpickr';
import { useReadTextFile } from './useReadTextFile';

type Task = {
  name: string;
  deadline: string;
};

const App = (): React.ReactElement => {
  const [input, setInput] = useState<string>('');
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [completeTasks, setCompleteTasks] = useState<Task[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const createTasks = [incompleteTasks, completeTasks, deletedTasks];
  const setCreateTasks = [
    setIncompleteTasks,
    setCompleteTasks,
    setDeletedTasks,
  ];
  const [dueDate, setDueDate] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [editingInput, setEditingInput] = useState<string>('');
  const [editingDueDate, setEditingDueDate] = useState<string>('');
  const [parentIndex, setParentIndex] = useState<number>(-1);
  const [childIndex, setChildIndex] = useState<number>(-1);

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onClickInputAdd = () => {
    if (input === '' || dueDate === '') return;
    const newInput = [...createTasks[0], { name: input, deadline: dueDate }];
    setCreateTasks[0](newInput);
    setInput('');
    setDueDate('');
  };

  const onClickDownloadData = () => {
    // 1. Blobオブジェクトを作成する
    // 2. HTMLのa要素を生成
    // 3. BlobオブジェクトをURLに変換
    // 4. ファイル名を指定する
    // 5. a要素をクリックする処理を行う
    const blob = new Blob([JSON.stringify(createTasks)], {
      type: 'text/plain',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${new Date().toISOString()}.txt`;
    link.click();
  };

  // JSONファイルを読み込む
  const readTextFile = useReadTextFile();
  const onChangeFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null || files.length === 0) return;
    const file = (files as FileList)[0];
    const newCreateTasks = JSON.parse((await readTextFile(file)) as string);
    setCreateTasks.forEach((setTasks, index) => {
      setTasks(newCreateTasks[index]);
    });
  };

  const onClickMove =
    (index: number, i: number, j: number, task: Task) => () => {
      // 1. createTasksを削除する
      //  1-1. createTasksのi番目をスプレッドする（newTasksとする）
      //  1-2. newTasksをspliceして、indexの1つ目を削除する
      //  1-3. setCreateTasksのi番目にnewTasksを入れる
      // 2. setCreateTasksに入れる
      //  2-1. setCreateTasksのj番目にスプレッドしたcreateTasksのj番目を入れる
      const newTasks = [...createTasks[i]];
      newTasks.splice(index, 1);
      setCreateTasks[i](newTasks);
      setCreateTasks[j]([...createTasks[j], task]);
    };

  const onClickCompleteDeleted = (index: number, i: number) => () => {
    // 1. deletedTasksを削除する
    //   1-1. i番目のcreateTasksをスプレッドする(newDeletedTasksとする)
    //   1-2. newDeletedTasksをspliceしてindex番目を1つ削除する
    //   1-3. i番目のsetCreateTasksにスプレッドしたnewDeletedTasksを入れる
    const newDeletedTasks = [...createTasks[i]];
    newDeletedTasks.splice(index, 1);
    setCreateTasks[i](newDeletedTasks);
  };

  const onChangeEditingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingInput(e.target.value);
  };

  const onClickEdit = (task: Task, p: number, c: number) => () => {
    setEditing(true);
    setEditingInput(task.name);
    setEditingDueDate(task.deadline);
    setParentIndex(p);
    setChildIndex(c);
  };

  const onClickEditOk = () => () => {
    const newTasks = [...createTasks[parentIndex]];
    newTasks.splice(childIndex, 1, {
      name: editingInput,
      deadline: editingDueDate,
    });
    setCreateTasks[parentIndex](newTasks);
    setParentIndex(-1);
    setChildIndex(-1);
    setEditing(false);
  };

  const onClickContent: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="body">
        <div className="head">
          <input
            placeholder="ToDoを入力"
            data-testid="input-task"
            onChange={onChangeInput}
            value={input}
          />
          <AppFlatpickr dueDate={dueDate} setDueDate={setDueDate} />
          <button data-testid="add-btn" onClick={onClickInputAdd}>
            追加
          </button>
          <button onClick={onClickDownloadData}>データダウンロード</button>
          <input
            type="file"
            accept="todoInstall/json"
            onChange={onChangeFileUpload}
          />
        </div>
        <div className="incomplete-tasks">
          <p>未完了のToDo</p>
          <DraggableList
            items={incompleteTasks}
            setItems={setIncompleteTasks}
            mapper={(incompleteTask, index) => (
              <>
                <div data-testid="incomplete-task" />
                {incompleteTask.name} 締切：{incompleteTask.deadline}
                <button
                  type="button"
                  data-testid="task-edit-btn"
                  onClick={onClickEdit(incompleteTask, 0, index)}
                >
                  編集
                </button>
                <button
                  type="button"
                  data-testid="complete-btn-from-incomplete"
                  onClick={onClickMove(index, 0, 1, incompleteTask)}
                >
                  完了
                </button>
                <button
                  type="button"
                  data-testid="delete-btn-from-incomplete"
                  onClick={onClickMove(index, 0, 2, incompleteTask)}
                >
                  削除
                </button>
              </>
            )}
          />
        </div>

        <div className="complete-tasks">
          <p>完了済みのToDo</p>
          <DraggableList
            items={completeTasks}
            setItems={setCompleteTasks}
            mapper={(completeTask, index) => (
              <>
                <div data-testid="complete-task" />
                {completeTask.name} 締切：{completeTask.deadline}
                <button
                  type="button"
                  onClick={onClickEdit(completeTask, 1, index)}
                >
                  編集
                </button>
                <button
                  type="button"
                  data-testid="incomplete-btn-from-complete"
                  onClick={onClickMove(index, 1, 0, completeTask)}
                >
                  未完了へ戻す
                </button>
                <button
                  type="button"
                  data-testid="delete-btn-from-complete"
                  onClick={onClickMove(index, 1, 2, completeTask)}
                >
                  削除
                </button>
              </>
            )}
          />
        </div>

        <div className="deleted-tasks">
          <p>削除済みのToDo</p>
          <DraggableList
            items={deletedTasks}
            setItems={setDeletedTasks}
            mapper={(deletedTask, index) => (
              <>
                <div data-testid="delete-task" />
                {deletedTask.name} 締切：{deletedTask.deadline}
                <button
                  type="button"
                  data-testid="complete-btn-from-delete"
                  onClick={onClickMove(index, 2, 1, deletedTask)}
                >
                  完了へ戻す
                </button>
                <button
                  type="button"
                  data-testid="incomplete-btn-from-delete"
                  onClick={onClickMove(index, 2, 0, deletedTask)}
                >
                  未完了へ戻す
                </button>
                <button
                  type="button"
                  data-testid="complete-delete-btn"
                  onClick={onClickCompleteDeleted(index, 2)}
                >
                  完全に削除
                </button>
              </>
            )}
          />
        </div>
      </div>
      {editing && (
        <div id="overlay" onClick={onClickEditOk()}>
          <div id="content" onClick={onClickContent}>
            <input
              placeholder="ToDoを入力"
              data-testid="input-task"
              onChange={onChangeEditingInput}
              value={editingInput}
            />
            <AppFlatpickr
              dueDate={editingDueDate}
              setDueDate={setEditingDueDate}
            />
            <p>
              <button data-testid="add-btn" onClick={onClickEditOk()}>
                OK
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
