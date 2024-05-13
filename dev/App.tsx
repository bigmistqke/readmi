import type {
  ClassElement,
  EnumElement,
  FunctionElement,
  FunctionTypeAnnotation,
  GenericDeclaration,
  IntersectionAnnotation,
  JSDocInfo,
  JSDocTag,
  Parameter,
  PrimitiveTypeAnnotation,
  TupleAnnotation,
  TypeAliasElement,
  TypeAnnotation,
  TypeLiteralAnnotation,
  TypeReferenceAnnotation,
  UnionAnnotation,
  VariableElement,
} from '@bigmistqke/readmi'
import { codeToHtml } from 'shiki'
import type { ComponentProps, JSX, ParentProps } from 'solid-js'
import { For, Show, Suspense, createResource, splitProps, type Component } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import data from '../src/data.ts'

import styles from './App.module.css'

/**********************************************************************************/
/*                                                                                */
/*                               Utility Components                               */
/*                                                                                */
/**********************************************************************************/

const Shiki = (props: { code: string }) => {
  const [html] = createResource(() =>
    codeToHtml(props.code, {
      lang: 'typescript',
      theme: 'vitesse-light',
    }),
  )
  return (
    <Suspense>
      <Pre class={styles.shiki} innerHTML={html()} />
    </Suspense>
  )
}

const Pre = (props: Omit<ComponentProps<'pre'>, 'style'> & { style?: JSX.CSSProperties }) => {
  const [, rest] = splitProps(props, ['style', 'children'])
  return (
    <pre style={{ margin: '0px', ...props.style }} {...rest}>
      {props.children}
    </pre>
  )
}
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

const LiteralComponent = (props: { literal?: string }) => (
  <Show when={props.literal}>
    {literal => (
      <Labelled label="literal">
        <Shiki code={literal()} />
      </Labelled>
    )}
  </Show>
)

const GenericDeclarationComponent = (props: { generics?: GenericDeclaration[] }) => {
  return (
    <Show when={props.generics}>
      <Labelled label="generics">
        <For each={props.generics}>
          {generic => (
            <Labelled label={generic.name}>
              <Show when={generic.defaultValue}>
                {defaultValue => <Labelled label="defaultValue" children={defaultValue()} />}
              </Show>
              <Show when={generic.extends}>
                {extending => <Labelled label="extends" children={extending()} />}
              </Show>
            </Labelled>
          )}
        </For>
      </Labelled>
    </Show>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                               JS Doc Components                                */
/*                                                                                */
/**********************************************************************************/

const JSDocTagComponent = (props: { tag: JSDocTag }) => {
  return (
    <Labelled label={`@${props.tag.tagName}`}>
      <Show
        when={props.tag.literal && props.tag.name && [props.tag.literal, props.tag.name]}
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
        {([literal, name]) => (
          <>
            <Labelled label="name" children={name} />
            <Show when={props.tag.comment}>
              {comment => <Labelled label="comment" children={comment()} />}
            </Show>
            <Labelled label="literal" children={<Shiki code={literal} />} />
          </>
        )}
      </Show>
    </Labelled>
  )
}

const JSDocComponent = (props: { jsdoc?: JSDocInfo }) => {
  return (
    <Show when={props.jsdoc}>
      {jsdoc => (
        <Labelled label="jsdoc">
          <For each={jsdoc().description}>
            {description => (
              <Pre>
                <i
                  style={{
                    'font-family': 'times new roman',
                    'font-size': '13pt',
                    display: 'block',
                  }}
                >
                  {description}
                </i>
              </Pre>
            )}
          </For>
          <For each={jsdoc().tags}>{tag => <JSDocTagComponent tag={tag} />}</For>
        </Labelled>
      )}
    </Show>
  )
}

/**********************************************************************************/
/*                                                                                */
/*                            Type Annotation Components                          */
/*                                                                                */
/**********************************************************************************/

const PrimitiveTypeAnnotationComponent = (props: { annotation: PrimitiveTypeAnnotation }) => {
  return <></>
}
const TypeReferenceAnnotationComponent = (props: { annotation: TypeReferenceAnnotation }) => {
  return (
    <>
      <Labelled label="name">
        <a href={`#${props.annotation.name}`}>{props.annotation.name}</a>
      </Labelled>
      <Show when={'arguments' in props.annotation && props.annotation}>
        {node => (
          <For each={node().parameters}>
            {annotation => (
              <Labelled label="arguments">
                <TypeAnnotationComponent annotation={annotation} />
              </Labelled>
            )}
          </For>
        )}
      </Show>
    </>
  )
}
const TypeLiteralAnnotationComponent = (props: { annotation: TypeLiteralAnnotation }) => {
  return (
    <Labelled
      label="properties"
      children={
        <For each={props.annotation.members}>
          {member => (
            <Labelled label={member.name}>
              <JSDocComponent jsdoc={member.jsdoc} />
              <Labelled label="type">
                <TypeAnnotationComponent annotation={member.typeAnnotation} />
              </Labelled>
            </Labelled>
          )}
        </For>
      }
    />
  )
}

const UnionAnnotationComponent = (props: { annotation: UnionAnnotation }) => {
  return (
    <Labelled label="types">
      <For each={props.annotation.types}>
        {annotation => <TypeAnnotationComponent annotation={annotation} />}
      </For>
    </Labelled>
  )
}
const IntersectionAnnotationComponent = (props: { annotation: IntersectionAnnotation }) => {
  return (
    <Labelled label="types">
      <For each={props.annotation.types}>
        {annotation => <TypeAnnotationComponent annotation={annotation} />}
      </For>
    </Labelled>
  )
}

const TupleAnnotationComponent = (props: { annotation: TupleAnnotation }) => {
  return (
    <Labelled label="types">
      <For each={props.annotation.types}>
        {annotation => <TypeAnnotationComponent annotation={annotation} />}
      </For>
    </Labelled>
  )
}

const FunctionTypeAnnotationComponent = (props: { annotation: FunctionTypeAnnotation }) => {
  return (
    <>
      <ParametersComponent parameters={props.annotation.parameters} />
      <GenericDeclarationComponent generics={props.annotation.generics} />
      <Labelled label="return">
        <Show when={props.annotation.returnType} fallback="void">
          {returnType => <TypeAnnotationComponent annotation={returnType()} />}
        </Show>
      </Labelled>
    </>
  )
}

const typeAnnotationComponents = {
  PrimitiveType: PrimitiveTypeAnnotationComponent,
  TypeReference: TypeReferenceAnnotationComponent,
  TypeLiteral: TypeLiteralAnnotationComponent,
  Union: UnionAnnotationComponent,
  Intersection: IntersectionAnnotationComponent,
  FunctionType: FunctionTypeAnnotationComponent,
  Tuple: TupleAnnotationComponent,
}

const TypeAnnotationComponent = (props: { annotation?: TypeAnnotation }) => {
  return (
    <Show when={props.annotation}>
      {annotation => {
        console.log('annotation().kind', annotation().kind)
        return (
          <>
            <Labelled label="kind" children={annotation().kind} />
            <Show when={annotation().literal}>
              {literal => <LiteralComponent literal={literal()} />}
            </Show>
            <Dynamic
              component={typeAnnotationComponents[annotation().kind]}
              annotation={annotation()}
            />
          </>
        )
      }}
    </Show>
  )
}

const VariableComponent = (props: { node: VariableElement }) => {
  return (
    <Block title={props.node.name} type="Variable">
      <LiteralComponent literal={props.node.literal} />
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <Show when={props.node.typeAnnotation}>
        {annotation => (
          <Labelled label="type">
            <TypeAnnotationComponent annotation={annotation()} />
          </Labelled>
        )}
      </Show>
    </Block>
  )
}

const FunctionComponent = (props: { node: FunctionElement }) => {
  return (
    <Block title={props.node.name} type="Function">
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <GenericDeclarationComponent generics={props.node.generics} />
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
            <Show when={parameter.typeAnnotation}>
              {type => (
                <Labelled label="type">
                  <TypeAnnotationComponent annotation={type()} />
                </Labelled>
              )}
            </Show>
            <JSDocComponent jsdoc={parameter.jsdoc} />
          </Labelled>
        )}
      </For>
    </Show>
  </Labelled>
)

const ClassComponent = (props: { node: ClassElement }) => {
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

const EnumComponent = (props: { node: EnumElement }) => {
  return (
    <Block title={props.node.name} type="Enum">
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <For each={props.node.members}>
        {member => (
          <Labelled label={member.name}>
            <JSDocComponent jsdoc={member.jsdoc} />
            <TypeAnnotationComponent annotation={member.typeAnnotation} />
            <Labelled label="value" children={member.value} />
          </Labelled>
        )}
      </For>
    </Block>
  )
}

const TypeAliasComponent = (props: { node: TypeAliasElement }) => {
  return (
    <Block title={props.node.name} type="TypeAlias">
      <LiteralComponent literal={props.node.literal} />
      <JSDocComponent jsdoc={props.node.jsdoc} />
      <GenericDeclarationComponent generics={props.node.generics} />
      <Show when={props.node.typeAnnotation}>
        {annotation => (
          <Labelled label="type">
            <TypeAnnotationComponent annotation={annotation()} />
          </Labelled>
        )}
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
