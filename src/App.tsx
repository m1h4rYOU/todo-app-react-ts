import React, {useState, useRef} from 'react';
import Flatpickr from "react-flatpickr";
import './App.css';
import "flatpickr/dist/flatpickr.css";

type Task = {
  name: string;
  deadline: string;
  // editTasks: string;
}

const App = (): React.ReactElement => {
  const [input, setInput] = useState<string>('')
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([])
  const [completeTasks, setCompleteTasks] = useState<Task[]>([])
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([])
  const createTasks = [incompleteTasks, completeTasks, deletedTasks]
  const setCreateTasks = [setIncompleteTasks, setCompleteTasks, setDeletedTasks]
  const [dueDate, setDueDate] = useState<string>('') 

  const fp = useRef<Flatpickr | null>(null)

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setInput(e.target.value)
  }

  const onClickInputAdd = ()=>{
    if (input === '' || dueDate === '' ) return
    const newInput = [...createTasks[0], {name: input, deadline: dueDate}]
    setCreateTasks[0](newInput)
    setInput('')
    setDueDate('')
  }

  const onClickMove = (index: number, i: number, j: number, task: Task)=>()=>{
    // 1. createTasksを削除する
    //  1-1. createTasksのi番目をスプレッドする（newTasksとする）
    //  1-2. newTasksをspliceして、indexの1つ目を削除する
    //  1-3. setCreateTasksのi番目にnewTasksを入れる
    // 2. setCreateTasksに入れる
    //  2-1. setCreateTasksのj番目にスプレッドしたcreateTasksのj番目を入れる
    const newTasks = [...createTasks[i]]
    newTasks.splice(index,1)
    setCreateTasks[i](newTasks)
    setCreateTasks[j]([...createTasks[j], task])
  }

  const onClickCompleteDeleted = (index:number, i: number)=>()=>{
    // 1. deletedTasksを削除する
    //   1-1. i番目のcreateTasksをスプレッドする(newDeletedTasksとする)
    //   1-2. newDeletedTasksをspliceしてindex番目を1つ削除する
    //   1-3. i番目のsetCreateTasksにスプレッドしたnewDeletedTasksを入れる
    const newDeletedTasks = [...createTasks[i]]
    newDeletedTasks.splice(index,1)
    setCreateTasks[i](newDeletedTasks)
  }

  const onClickEditTasks = (task: Task, index: number, i: number)=>()=>{
    // 1. i番目のcreateTasksを削除する
    //  1-1. createTasksのi番目をスプレッドする（newTasksとする）
    //  1-2. window.promptを表示（editTasksとする）
    //  1-3. newTasksをspliceしてindex番目の1つを削除する
    // 2. i番目のsetCreateTasksに入れる
    //  2-1. i番目のsetCreateTasksにスプレッドしたnewTasksを入れる
    const newTasks = [...createTasks[i]]
    const editTask = window.prompt('編集してください')
    // const deadline = createTasks[i][index].deadline
    if(editTask === null){return}
    newTasks.splice(index, 1, {name: editTask, deadline: task.deadline})
    setCreateTasks[i](newTasks)
  }
  
  const onChangeDate = (_: Date[], dateStr: string)=>{
    setDueDate(dateStr)
  }
  
  return(
    <div className="body">
      <div className="head">
        <input placeholder='ToDoを入力' onChange={onChangeInput} value={input}/>
        <Flatpickr ref={fp} placeholder='締切' onChange={onChangeDate}/>
        <button
          type="button"
          onClick={() => {
            if (!fp?.current?.flatpickr) return;
            fp.current.flatpickr.clear();
          }}
        >
          締切削除
        </button>
        <button onClick={onClickInputAdd}>追加</button>
      </div>
      <div className='incomplete-tasks'>
      <p>未完了のToDo</p>
        <ul>
          {incompleteTasks.map((incompleteTask, index)=>
            <li>{incompleteTask.name} '締切：'{incompleteTask.deadline}
              <button type='button' onClick={onClickEditTasks(incompleteTask, index, 0)}>編集</button>
              <button type='button' onClick={onClickMove(index, 0, 1, incompleteTask)}>完了</button>
              <button type='button' onClick={onClickMove(index, 0, 2, incompleteTask)}>削除</button>
            </li>
          )}
        </ul>
      </div>

      <div className='complete-tasks'>
        <p>完了済みのToDo</p>
        <ul>
          {completeTasks.map((completeTask, index)=>
          <li>
            {completeTask.name} '締切：'{completeTask.deadline}
            <button type='button' onClick={onClickEditTasks(completeTask, index, 0)}>編集</button>
            <button type='button' onClick={onClickMove(index, 1, 0, completeTask)}>未完了へ戻す</button>
            <button type='button' onClick={onClickMove(index, 1, 2, completeTask)}>削除</button>
          </li>
          )}
        </ul>
      </div>
      
      <div className='deleted-tasks'>
        <p>削除済みのToDo</p>
        <ul>
          {deletedTasks.map((deletedTask, index)=>
          <li>
            {deletedTask.name} '締切：'{deletedTask.deadline}
            <button type='button' onClick={onClickMove(index, 2, 1, deletedTask)}>完了へ戻す</button>
            <button type='button' onClick={onClickMove(index, 2, 0, deletedTask)}>未完了へ戻す</button>
            <button type='button' onClick={onClickCompleteDeleted(index, 2)}>完全に削除</button>
          </li>
          )}
        </ul>
      </div>
    </div>
  );

}

export default App;
