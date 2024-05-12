import { codeToHtml } from 'shiki'
import type { ComponentProps, JSX, ParentProps } from 'solid-js'
import { For, Show, Suspense, createResource, type Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import data from '../src/data.ts'
import type {
  Class,
  ComplexType,
  Enum,
  Function,
  JSDocInfo,
  JSDocTag,
  Parameter,
  PrimitiveType,
  TypeAlias,
  TypeAnnotation,
  TypeLiteral,
  TypeReference,
  UnionOrIntersection,
  Variable,
} from '../src/parse-dts'

import styles from './App.module.css'

const Shiki = (props: { code: string }) => {
  const [html] = createResource(() =>
    codeToHtml(props.code, {
      lang: 'typescript',
      theme: 'vitesse-light',
    }),
  )
  return (
    <Suspense>
      <div class={styles.shiki} innerHTML={html()} />
    </Suspense>
  )
}

const Pre = (props: ParentProps) => <pre style={{ margin: '0px' }}>{props.children}</pre>
const Base = (props: Omit<ComponentProps<'div'>, 'style'> & { style?: JSX.CSSProperties }) => (
  <div
    {...props}
    style={{ display: 'grid', 'grid-template-columns': '1fr', gap: '20px', ...props.style }}
  />
)
const Labelled = (props: { label: JSX.Element; children: JSX.Element }) => {
  return (
    <Base style={{ 'grid-template-columns': '100px 1fr' }}>
      <div style={{ color: 'grey' }}>{props.label}</div>
      <Base>{props.children}</Base>
    </Base>
  )
}
const Title = (props: { title: string; type: string }) => (
  <div style={{ display: 'flex', 'align-items': 'center', gap: '20px' }}>
    <h3 id={props.title}>{props.title}</h3>
    <i>({props.type})</i>
  </div>
)
const Block = (props: ParentProps<ComponentProps<typeof Title>>) => (
  <Base>
    <Title title={props.title} type={props.type} />
    {props.children}
  </Base>
)

const JSDocTagComponent = (props: { tag: JSDocTag }) => {
  return (
    <Labelled label={`@${props.tag.tagName}`}>
      <Show
        when={props.tag.type && props.tag.name && [props.tag.type, props.tag.name]}
        keyed
        fallback={
          <Show when={props.tag.comment}>
            {comment => (
              <Show when={props.tag.tagName !== 'example'} fallback={<Shiki code={comment()} />}>
                {comment()}
              </Show>
            )}
          </Show>
        }
      >
        {([type, name]) => (
          <>
            <Labelled label="name" children={name} />
            <Show when={props.tag.comment}>
              {comment => <Labelled label="comment" children={comment()} />}
            </Show>
            <Labelled label="type" children={<Shiki code={type} />} />
          </>
        )}
      </Show>
    </Labelled>
  )
}

const JSDocComponent = (props: { jsdoc: JSDocInfo }) => {
  console.log('props.jsdoc', props.jsdoc)
  return (
    <Show when={props.jsdoc}>
      <Labelled label="jsdoc">
        <Pre>
          <For each={props.jsdoc.description}>
            {description => (
              <i style={{ 'font-family': 'times new roman', 'font-size': '13pt' }}>{description}</i>
            )}
          </For>
        </Pre>
        <For each={props.jsdoc.tags}>{tag => <JSDocTagComponent tag={tag} />}</For>
      </Labelled>
    </Show>
  )
}

const PrimitiveTypeComponent = (props: { node: PrimitiveType }) => {
  return (
    <>
      <Labelled label="kind" children={props.node.kind} />
      <Labelled label="type">
        <Shiki code={props.node.type} />
      </Labelled>
    </>
  )
}
const TypeReferenceComponent = (props: { node: TypeReference }) => {
  return (
    <>
      <Labelled label="kind" children={props.node.kind} />
      <Labelled label="name">
        <a href={`#${props.node.name}`}>{props.node.name}</a>
      </Labelled>
    </>
  )
}
const TypeLiteralComponent = (props: { node: TypeLiteral }) => {
  return (
    <>
      <Labelled label="kind" children={props.node.kind} />
      <Labelled
        label="properties"
        children={
          <For each={props.node.members}>
            {member => (
              <Labelled label={member.name}>
                <JSDocComponent jsdoc={member.jsdoc} />
                <TypeAnnotationComponent annotation={member.type} />
              </Labelled>
            )}
          </For>
        }
      />
    </>
  )
}

const UnionComponent = (props: { node: UnionOrIntersection }) => {
  return (
    <>
      <Labelled label="kind" children={props.node.kind} />
      <For each={props.node.types}>
        {annotation => <TypeAnnotationComponent annotation={annotation} />}
      </For>
    </>
  )
}
const IntersectionComponent = (props: { node: UnionOrIntersection }) => {
  return (
    <>
      <Labelled label="kind" children={props.node.kind} />
      <For each={props.node.types}>
        {annotation => <TypeAnnotationComponent annotation={annotation} />}
      </For>
    </>
  )
}
const ComplexTypeComponent = (props: { node: ComplexType }) => {
  return (
    <>
      <Labelled label="kind" children={props.node.kind} />
      <Labelled label="details" children={props.node.details} />
    </>
  )
}

const typeAnnotationComponents = {
  PrimitiveType: PrimitiveTypeComponent,
  TypeReference: TypeReferenceComponent,
  TypeLiteral: TypeLiteralComponent,
  Union: UnionComponent,
  Intersection: IntersectionComponent,
  ComplexType: ComplexTypeComponent,
}

const TypeAnnotationComponent = (props: { annotation: TypeAnnotation }) => {
  return (
    <Dynamic component={typeAnnotationComponents[props.annotation.kind]} node={props.annotation} />
  )
}

const VariableComponent = (props: { node: Variable }) => {
  return (
    <Block title={props.node.name} type="Variable">
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <Show when={props.node.typeAnnotation}>
        {annotation => <TypeAnnotationComponent annotation={annotation()} />}
      </Show>
    </Block>
  )
}

const FunctionComponent = (props: { node: Function }) => {
  return (
    <Block title={props.node.name} type="Function">
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <ParametersComponent parameters={props.node.parameters} />
      <Labelled label="return">
        <Show when={props.node.returnType} fallback="void">
          {returnType => <TypeAnnotationComponent annotation={returnType()} />}
        </Show>
      </Labelled>
    </Block>
  )
}

const ParametersComponent = (props: { parameters: readonly Parameter[] }) => (
  <Labelled label="parameters">
    <Show when={props.parameters.length > 0} fallback={<i style={{ color: 'grey' }}>empty</i>}>
      <For each={props.parameters}>
        {parameter => (
          <Labelled label={parameter.name}>
            <Labelled label="type">
              <TypeAnnotationComponent annotation={parameter.type} />
            </Labelled>
            <JSDocComponent jsdoc={parameter.jsdoc} />
          </Labelled>
        )}
      </For>
    </Show>
  </Labelled>
)

const ClassComponent = (props: { node: Class }) => {
  return (
    <Block title={props.node.name} type="Class">
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <Labelled label="members">
        <For each={props.node.members}>
          {member => (
            <Labelled label={member.name || <i>constructor</i>}>
              <JSDocComponent jsdoc={member.jsdoc} />
              <Show when={member.parameters}>
                {parameters => <ParametersComponent parameters={parameters()} />}
              </Show>
              <Show when={member.typeAnnotation}>
                {typeAnnotation => <TypeAnnotationComponent annotation={typeAnnotation()} />}
              </Show>
            </Labelled>
          )}
        </For>
      </Labelled>
    </Block>
  )
}

const EnumComponent = (props: { node: Enum }) => {
  return (
    <Block title={props.node.name} type="Enum">
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <For each={props.node.members}>
        {member => (
          <Labelled label={member.name}>
            <JSDocComponent jsdoc={member.jsdoc} />
          </Labelled>
        )}
      </For>
    </Block>
  )
}

const TypeAliasComponent = (props: { node: TypeAlias }) => {
  return (
    <Block title={props.node.name} type="TypeAlias">
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <Show when={props.node.typeAnnotation}>
        {annotation => <TypeAnnotationComponent annotation={annotation()} />}
      </Show>
    </Block>
  )
}

const App: Component = () => {
  const components = {
    Variable: VariableComponent,
    Function: FunctionComponent,
    Class: ClassComponent,
    Enum: EnumComponent,
    TypeAlias: TypeAliasComponent,
  }

  return (
    <Base style={{ padding: '20px' }}>
      <For each={data}>{value => <Dynamic component={components[value.kind]} node={value} />}</For>
    </Base>
  )
}

export default App
