import React, { ChangeEvent, useState } from 'react';
import './App.css';
import DraggableList from './Draggable';
import AppFlatpickr from './Flatpickr';
import { useReadTextFile } from './useReadTextFile';

type Task = {
  title: string;
  dueDate: string;
};

const Status = {
  Unfinished: 0,
  Finished: 1,
  Deleted: 2,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
type Status = (typeof Status)[keyof typeof Status];

const App = (): React.ReactElement => {
  const [unfinishedTasks, setUnfinishedTasks] = useState<Task[]>([]);
  const [finishedTasks, setFinishedTasks] = useState<Task[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const tasks = [unfinishedTasks, finishedTasks, deletedTasks];
  const setTasks = [setUnfinishedTasks, setFinishedTasks, setDeletedTasks];

  const [addingTaskTitle, setAddingTaskTitle] = useState<string>('');
  const [addingTaskDueDate, setAddingTaskDueDate] = useState<string>('');

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingTaskStatus, setEditingTaskStatus] = useState<Status | null>(null);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number>(-1);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [editingDueDate, setEditingDueDate] = useState<string>('');

  const onChangeAddingTaskTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddingTaskTitle(e.target.value);
  };

  const onClickAdd = () => {
    if (addingTaskTitle === '') return;
    const newUnfinishedTasks = [
      ...tasks[Status.Unfinished],
      { title: addingTaskTitle, dueDate: addingTaskDueDate },
    ];
    setTasks[Status.Unfinished](newUnfinishedTasks);
    setAddingTaskTitle('');
    setAddingTaskDueDate('');
  };

  const onClickFileDownload = () => {
    // 1. Blobオブジェクトを作成する
    // 2. HTMLのa要素を生成
    // 3. BlobオブジェクトをURLに変換
    // 4. ファイル名を指定する
    // 5. a要素をクリックする処理を行う
    const blob = new Blob([JSON.stringify(tasks)], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${new Date().toISOString()}.json`;
    link.click();
  };
  // JSONファイルを読み込む
  const readTextFile = useReadTextFile();
  const onChangeUploadedFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files === null || files.length === 0) return;
    const file = files[0];
    const newTasks = JSON.parse((await readTextFile(file)) as string);
    Object.values(Status).forEach((status) => {
      setTasks[status](newTasks[status]);
    });
  };

  // ---------------- ここから定数や関数の書き換え ----------------
  const onClickMove = (index: number, i: number, j: number, task: Task) => () => {
    // 1. createTasksを削除する
    //  1-1. createTasksのi番目をスプレッドする（newTasksとする）
    //  1-2. newTasksをspliceして、indexの1つ目を削除する
    //  1-3. setCreateTasksのi番目にnewTasksを入れる
    // 2. setCreateTasksに入れる
    //  2-1. setCreateTasksのj番目にスプレッドしたcreateTasksのj番目を入れる
    const newTasks = [...tasks[i]];
    newTasks.splice(index, 1);
    setTasks[i](newTasks);
    setTasks[j]([...tasks[j], task]);
  };

  const onClickCompleteDeleted = (index: number, i: number) => () => {
    // 1. deletedTasksを削除する
    //   1-1. i番目のcreateTasksをスプレッドする(newDeletedTasksとする)
    //   1-2. newDeletedTasksをspliceしてindex番目を1つ削除する
    //   1-3. i番目のsetCreateTasksにスプレッドしたnewDeletedTasksを入れる
    const newDeletedTasks = [...tasks[i]];
    newDeletedTasks.splice(index, 1);
    setTasks[i](newDeletedTasks);
  };

  const onChangeEditingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  };

  const onClickEdit = (task: Task, p: Status, c: number) => () => {
    setIsEditMode(true);
    setEditingTitle(task.title);
    setEditingDueDate(task.dueDate);
    setEditingTaskStatus(p);
    setEditingTaskIndex(c);
  };

  const onClickEditOk = () => () => {
    const newTasks = [...tasks[editingTaskStatus!]];
    newTasks.splice(editingTaskIndex, 1, {
      title: editingTitle,
      dueDate: editingDueDate,
    });
    setTasks[editingTaskStatus!](newTasks);
    setEditingTaskStatus(null);
    setEditingTaskIndex(-1);
    setIsEditMode(false);
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
            onChange={onChangeAddingTaskTitle}
            value={addingTaskTitle}
          />
          <AppFlatpickr dueDate={addingTaskDueDate} setDueDate={setAddingTaskDueDate} />
          <button data-testid="add-btn" onClick={onClickAdd}>
            追加
          </button>
          <button onClick={onClickFileDownload}>データダウンロード</button>
          <input type="file" accept=".json" onChange={onChangeUploadedFile} />
        </div>
        <div className="unfinished-tasks">
          <p>未完了のToDo</p>
          <DraggableList
            items={unfinishedTasks}
            setItems={setUnfinishedTasks}
            mapper={(unfinishedTask, index) => (
              <>
                <div data-testid="unfinished-task" />
                {unfinishedTask.title} 締切：{unfinishedTask.dueDate}
                <button
                  type="button"
                  data-testid="task-edit-btn"
                  onClick={onClickEdit(unfinishedTask, 0, index)}
                >
                  編集
                </button>
                <button
                  type="button"
                  data-testid="finished-btn-from-unfinished"
                  onClick={onClickMove(index, 0, 1, unfinishedTask)}
                >
                  完了
                </button>
                <button
                  type="button"
                  data-testid="delete-btn-from-unfinished"
                  onClick={onClickMove(index, 0, 2, unfinishedTask)}
                >
                  削除
                </button>
              </>
            )}
          />
        </div>

        <div className="finished-tasks">
          <p>完了済みのToDo</p>
          <DraggableList
            items={finishedTasks}
            setItems={setFinishedTasks}
            mapper={(finishedTask, index) => (
              <>
                <div data-testid="finished-task" />
                {finishedTask.title} 締切：{finishedTask.dueDate}
                <button type="button" onClick={onClickEdit(finishedTask, 1, index)}>
                  編集
                </button>
                <button
                  type="button"
                  data-testid="unfinished-btn-from-finished"
                  onClick={onClickMove(index, 1, 0, finishedTask)}
                >
                  未完了へ戻す
                </button>
                <button
                  type="button"
                  data-testid="delete-btn-from-finished"
                  onClick={onClickMove(index, 1, 2, finishedTask)}
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
                {deletedTask.title} 締切：{deletedTask.dueDate}
                <button
                  type="button"
                  data-testid="finished-btn-from-delete"
                  onClick={onClickMove(index, 2, 1, deletedTask)}
                >
                  完了へ戻す
                </button>
                <button
                  type="button"
                  data-testid="unfinished-btn-from-delete"
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
      {isEditMode && (
        <div id="overlay" onClick={onClickEditOk()}>
          <div id="content" onClick={onClickContent}>
            <input
              placeholder="ToDoを入力"
              data-testid="input-task"
              onChange={onChangeEditingInput}
              value={editingTitle}
            />
            <AppFlatpickr dueDate={editingDueDate} setDueDate={setEditingDueDate} />
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
