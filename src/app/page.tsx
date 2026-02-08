import PageWrapper from './pageWrapper';

// 主页的主要功能是提供一个输入框，让用户输入医疗问题，并在用户提交后创建一个新的对话（chat），然后跳转到对应的对话页面；因此，这个主页本身并不需要做数据获取的工作，所有的逻辑都可以放在 PageWrapper 组件里实现
// 如果后续会有获取数据的功能，或者需要在服务端渲染时就获取数据，那么再把数据获取的逻辑放在这个 Page 组件里实现，并通过 props 传递给 PageWrapper；但目前来看，PageWrapper 里已经没有什么需要服务端渲染的内容了，所以就直接让 PageWrapper 来处理所有的逻辑吧
export default async function Page() {

  return (
    <PageWrapper />
  );
}