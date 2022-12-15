import React, {useState} from 'react';
// import './App.css';

const App = (): React.ReactElement => {
  const [input, setInput] = useState<string>('')
  const [incompleteTasks, setIncompleteTasks] = useState<string[]>([])
  const [completeTasks, setCompleteTasks] = useState<string[]>([])
  const [deletedTasks, setDeletedTasks] = useState<string[]>([])

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setInput(e.target.value)
  }

  const onClickInputAdd = ()=>{
    if (input === '') return
    const newInput = [...incompleteTasks,input]
    setIncompleteTasks(newInput)
    setInput('')
  }

  const onClickMoveToComplete = (index:number, task:string)=>()=>{
    const newIncompleteTasks = [...incompleteTasks]
    newIncompleteTasks.splice(index, 1)
    setIncompleteTasks(newIncompleteTasks)
    setCompleteTasks([...completeTasks, task])
  }

  const onClickBackToIncomplete = (index:number, task:string)=>()=>{
    // 1.completeTasksを削除する
    //  1-1. completeTasksをスプレッドする
    //  1-2. completeTasksをspliceしてindex番目を1つ削除する
    //  1-3. setCompleteTasksに1-2.を入れる
    // 2. setIncompleteTasksに入れる
    //  2-1. setIncompleteTasksにスプレッドしたincompleteTasksを入れる
    const newCompleteTasks = [...completeTasks]
    newCompleteTasks.splice(index,1)
    setCompleteTasks(newCompleteTasks)
    setIncompleteTasks([...incompleteTasks, task])
  }

  const onClickMoveFromCompleteToDeleted = (index:number, task:string)=>()=>{
    // 1. completeTasksを削除する
    //  1-1. completeTasksをスプレッドする(newDeletedTasksとする)
    //  1-2. newDeletedTasksをspliceしてindex番目を1つ削除する
    //  1-3. setCompleteTasksにnewDeletedTasksを入れる
    // 2. setDeletedTasksに入れる
    //  2-1. setDeletedTasksにスプレッドしたdeletedTasksを入れる
    const newDeletedTasks = [...completeTasks]
    newDeletedTasks.splice(index,1)
    setCompleteTasks(newDeletedTasks)
    setDeletedTasks([...deletedTasks, task])
  }

  const onClickFromIncompleteToDeleted = (index:number, task:string)=>()=>{
    // 1. incompleteTasksを削除する
    //  1-1. incompleteTasksをスプレッドする(newDeletedTasksとする)
    //  1-2. newDeletedTasksをspliceしてindex番目の1つを削除する
    //  1-3. setIncompleteTasksにnewDeletedTasksを入れる
    // 2. setDeletedTasksに入れる
    //  2-1. setDeletedTasksにスプレッドしたdeletedTasksを入れる
    const newDeletedTasks = [...incompleteTasks]
    newDeletedTasks.splice(index, 1)
    setIncompleteTasks(newDeletedTasks)
    setDeletedTasks([...deletedTasks, task])
  }

  const onClickBackFromDeletedToCompleted = (index:number, task:string)=>()=>{
    // 1. deletedTasksを削除する
    //  1-1. deletedTasksをスプレッドする(newDeletedTasksとする)
    //  1-2. newDeletedTasksをspliceしてindex番目を1つ削除する
    //  1-3. setDeletedTasksにnewDeletedTasksを入れる
    // 2. setCompleteTasksに入れる
    //  2-1. setCompleteTasksにスプレッドしたcompleteTasksを入れる
    const newDeletedTasks = [...deletedTasks]
    newDeletedTasks.splice(index,1)
    setDeletedTasks(newDeletedTasks)
    setCompleteTasks([...completeTasks, task])
  }

  const onClickBackFromDeletedToIncomplete = (index:number, task:string)=>()=>{
    // 1. deletedTasksを削除する
    //  1-1. deletedTasksをスプレッドする(newDeletedTasksとする)
    //  1-2. newDeletedTasksをspliceしてindex番目を1つ削除する
    //  1-3. setDeletedTasksにnewDeletedTasksを入れる
    // 2. setIncompleteTasksに入れる
    //  2-1. setIncompleteTasksにスプレッドしたincompleteTasksを入れる
    const newDeletedTasks = [...deletedTasks]
    newDeletedTasks.splice(index, 1)
    setDeletedTasks(newDeletedTasks)
    setIncompleteTasks([...incompleteTasks, task])
  }

  const onClickCompleteDeleted = (index:number)=>()=>{
    // 1. deletedTasksを削除する
    //   1-1. deletedTasksをスプレッドする(newDeletedTasksとする)
    //   1-2. newDeletedTasksをspliceしてindex番目を1つ削除する
    //   1-3. setDeletedTasksにスプレッドしたnewDeletedTasksを入れる
    const newDeletedTasks = [...deletedTasks]
    newDeletedTasks.splice(index,1)
    setDeletedTasks(newDeletedTasks)
  }

  return(
    <>
    <input placeholder='ToDoを入力' onChange={onChangeInput} value={input}/>
    <button onClick={onClickInputAdd}>追加</button>

    <p>未完了のToDo</p>
    <ul>
      {incompleteTasks.map((incompleteTask, index)=>
        <li>{incompleteTask}
          <button type='button' onClick={onClickMoveToComplete(index, incompleteTask)}>完了</button>
          <button type='button' onClick={onClickFromIncompleteToDeleted(index, incompleteTask)}>削除</button>
        </li>
      )}
    </ul>

    <p>完了済みのToDo</p>
    <ul>
      {completeTasks.map((completeTask, index)=>
      <li>
        {completeTask}
        <button type='button' onClick={onClickBackToIncomplete(index, completeTask)}>未完了へ戻す</button>
        <button type='button' onClick={onClickMoveFromCompleteToDeleted(index, completeTask)}>削除</button>
      </li>
      )}
    </ul>
    
    <p>削除済みのToDo</p>
    <ul>
      {deletedTasks.map((deletedTask, index)=>
      <li>
        {deletedTask}
        <button type='button' onClick={onClickBackFromDeletedToCompleted(index, deletedTask)}>完了へ戻す</button>
        <button type='button' onClick={onClickBackFromDeletedToIncomplete(index, deletedTask)}>未完了へ戻す</button>
        <button type='button' onClick={onClickCompleteDeleted(index)}>完全に削除</button>
      </li>
      )}
    </ul>
    </>
  );

}

export default App;
