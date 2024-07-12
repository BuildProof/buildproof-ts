import * as React from 'react'
import { useEffect, useState } from 'react'

import {
  Button,
  DialogHeader,
  Icon,
  Input,
  Label,
  Textarea,
} from '@0xintuition/1ui'
import { UserPresenter } from '@0xintuition/api'

import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useImageUploadFetcher } from '@lib/hooks/useImageUploadFetcher'
import { useOffChainFetcher } from '@lib/hooks/useOffChainFetcher'
import {
  identityTransactionReducer,
  initialIdentityTransactionState,
  useTransactionState,
} from '@lib/hooks/useTransactionReducer'
import { updateProfileSchema } from '@lib/schemas/update-profile-schema'
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  DESCRIPTION_MAX_LENGTH,
  MAX_NAME_LENGTH,
  MAX_UPLOAD_SIZE,
} from '@lib/utils/constants'
import logger from '@lib/utils/logger'
import { truncateString } from '@lib/utils/misc'
import { useLocation } from '@remix-run/react'
import { toast } from 'sonner'
import {
  IdentityTransactionActionType,
  IdentityTransactionStateType,
} from 'types/transaction'

import ErrorList from '../error-list'
import { ImageChooser } from '../image-chooser'
import Toast from '../toast'

interface EditProfileFormProps {
  userObject: UserPresenter
  onSuccess?: () => void
  onClose: () => void
}

export function EditProfileForm({ userObject, onClose }: EditProfileFormProps) {
  const { state, dispatch } = useTransactionState<
    IdentityTransactionStateType,
    IdentityTransactionActionType
  >(identityTransactionReducer, initialIdentityTransactionState)

  const location = useLocation()
  const isCreateRoute = location.pathname.includes('create')

  const [identityImageFile, setIdentityImageFile] = useState<File | undefined>(
    undefined,
  )

  const imageUploadFetcher = useImageUploadFetcher()

  const { offChainFetcher, lastOffChainSubmission } = useOffChainFetcher()

  const [imageFilename, setImageFilename] = useState<string | null>(null)
  const [imageFilesize, setImageFilesize] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState(userObject.display_name ?? '')
  const [description, setDescription] = useState(userObject.description ?? '')

  const [form, fields] = useForm({
    id: 'update-profile',
    lastResult: lastOffChainSubmission,
    constraint: getZodConstraint(updateProfileSchema()),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: updateProfileSchema,
      })
    },
    shouldValidate: 'onInput',
    onSubmit: async (e) => handleSubmit(e),
  })
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const handleFileChange = (filename: string, filesize: string) => {
    setImageFilename(filename)
    setImageFilesize(filesize)
  }

  useEffect(() => {
    if (identityImageFile) {
      if (
        !ACCEPTED_IMAGE_MIME_TYPES.includes(identityImageFile.type) ||
        identityImageFile.size > MAX_UPLOAD_SIZE
      ) {
        console.error('Invalid image file', identityImageFile)
        return
      }

      const formData = new FormData()
      formData.append('image_url', identityImageFile)

      imageUploadFetcher.submit(formData, {
        action: '/actions/upload-image',
        method: 'post',
        encType: 'multipart/form-data',
      })
    }
  }, [identityImageFile])

  // Handle Triggering Image Upload
  useEffect(() => {
    if (imageUploadFetcher.state === 'submitting') {
      dispatch({ type: 'START_IMAGE_UPLOAD' })
      logger('uploading img')
    }
    if (
      imageUploadFetcher.state === 'idle' &&
      imageUploadFetcher.data &&
      imageUploadFetcher.data
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = imageUploadFetcher.data as any

      if (typeof data.submission.payload.image_url !== 'string') {
        logger('Transaction Error')
        dispatch({
          type: 'TRANSACTION_ERROR',
          error: 'Your profile picture was rejected.',
        })
      } else {
        dispatch({
          type: 'IMAGE_UPLOAD_COMPLETE',
          imageUrl: data.submission.payload.image_url ?? '',
          displayName: data.submission.payload.display_name ?? '',
          description: data.submission.payload.description ?? '',
          externalReference: '',
        })
      }
    }
  }, [imageUploadFetcher.state, imageUploadFetcher.data, dispatch])

  useEffect(() => {
    if (state.status === 'image-upload-complete') {
      // Prepare the formData or payload for the off-chain transaction
      const formData = new FormData()
      formData.append('id', userObject.id ?? '')
      formData.append('image_url', state.imageUrl ?? '')
      formData.append('display_name', state.displayName ?? '')
      formData.append('description', state.description ?? '')

      // Submit the off-chain transaction
      try {
        offChainFetcher.submit(formData, {
          action: '/actions/edit-profile',
          method: 'post',
        })
        onClose()
      } catch (error: unknown) {
        if (error instanceof Error) {
          let errorMessage = 'Error in creating offchain identity data.'
          if (error.message.includes('rejected')) {
            errorMessage = 'Signature rejected. Try again when you are ready.'
          }
          dispatch({
            type: 'TRANSACTION_ERROR',
            error: errorMessage,
          })
          toast.custom(
            () => (
              <Toast
                title="Error"
                description={errorMessage}
                icon={
                  <Icon
                    name="triangle-exclamation"
                    className="h-3 w-3 text-destructive"
                  />
                }
              />
            ),
            {
              duration: 5000,
            },
          )
          return
        }
        console.error('Error creating identity', error)
      }
    }
  }, [imageUploadFetcher.state, imageUploadFetcher.data, state])

  // Handle Initial Form Submit
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log('Form submitting')
    event.preventDefault()
    if (userObject.image !== previewImage) {
      try {
        dispatch({ type: 'START_TRANSACTION' })
        const formData = new FormData(event.currentTarget)

        // Initial form validation
        const submission = parseWithZod(formData, {
          schema: updateProfileSchema(),
        })

        if (
          submission.status === 'error' &&
          submission.error !== null &&
          Object.keys(submission.error).length
        ) {
          console.error('Update profile validation errors: ', submission.error)
        }

        setLoading(true)
        dispatch({ type: 'START_IMAGE_UPLOAD' })
        imageUploadFetcher.submit(formData, {
          action: '/actions/upload-with-metadata',
          method: 'post',
          encType: 'multipart/form-data',
        })
      } catch (error: unknown) {
        logger(error)
      }
    } else {
      try {
        dispatch({ type: 'START_TRANSACTION' })
        const formData = new FormData(event.currentTarget)

        console.log('previewImage', previewImage)
        formData.append('id', userObject.id ?? '')
        formData.append('image_url', previewImage ?? '')

        offChainFetcher.submit(formData, {
          action: '/actions/edit-profile',
          method: 'post',
        })
        onClose()
      } catch (error: unknown) {
        if (error instanceof Error) {
          let errorMessage = 'Error in creating offchain identity data.'
          if (error.message.includes('rejected')) {
            errorMessage = 'Signature rejected. Try again when you are ready.'
          }
          dispatch({
            type: 'TRANSACTION_ERROR',
            error: errorMessage,
          })
          toast.custom(
            () => (
              <Toast
                title="Error"
                description={errorMessage}
                icon={
                  <Icon
                    name="triangle-exclamation"
                    className="h-3 w-3 text-destructive"
                  />
                }
              />
            ),
            {
              duration: 5000,
            },
          )
          return
        }
        console.error('Error creating identity', error)
      }
    }
  }

  // Handle display name input changes
  const handleDisplayNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDisplayName(event.target.value)
  }

  // Handle description input changes
  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(event.target.value)
  }

  useEffect(() => {
    if (userObject.image) {
      setPreviewImage(userObject.image)
    }
  }, [userObject.image])

  return (
    <>
      <>
        <DialogHeader className="py-4">
          <div className="absolute top-5 flex flex-row items-center gap-2 align-baseline text-primary-400">
            <h2 className="text-xl text-white/70 font-normal">
              {isCreateRoute ? 'Create Profile' : 'Update Profile'}
            </h2>
            <Icon
              name="circle-question-mark"
              className="h-4 w-4 text-neutral-500 transition-colors duration-300 hover:text-neutral-400"
            />
          </div>
        </DialogHeader>

        <offChainFetcher.Form
          method="post"
          {...getFormProps(form)}
          encType="multipart/form-data"
          action="/actions/edit-profile"
        >
          <div className="h-[184px] w-full py-1 flex-col justify-start items-start inline-flex">
            <div className="self-stretch h-[38px] py-2.5 flex-col justify-start items-start gap-1 flex">
              <div className="self-stretch justify-start items-center gap-2.5 inline-flex">
                <div className="grow shrink basis-0 text-white/70 text-xs font-medium leading-[18px]">
                  Profile Picture
                </div>
              </div>
            </div>
            <div className="self-stretch h-[100px] px-9 py-2.5 border border-input/30 bg-primary/10 rounded-md justify-between items-center inline-flex">
              <div className="justify-start items-center gap-[18px] flex">
                <div className="w-[60px] h-[60px] rounded-xl justify-center items-center flex">
                  <ImageChooser
                    previewImage={previewImage}
                    setPreviewImage={setPreviewImage}
                    onFileChange={handleFileChange}
                    setImageFile={setIdentityImageFile}
                    {...getInputProps(fields.image_url, { type: 'file' })}
                  />
                </div>
                <div className="flex-col justify-start items-start inline-flex">
                  <div className="text-center text-neutral-200 text-sm font-normal leading-tight">
                    {truncateString(imageFilename ?? '', 36)}
                  </div>
                  <div className="text-center text-neutral-200 text-xs font-normal leading-[18px]">
                    {imageFilesize}
                  </div>
                </div>
              </div>
              <div className="flex-col justify-end items-end inline-flex">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setPreviewImage(null)
                    setImageFilename(null)
                    setImageFilesize(null)
                  }}
                  className={`${previewImage === null ? 'hidden' : 'block'}`}
                >
                  <Icon
                    name="circle-x"
                    className="h-6 w-6 relative text-neutral-700 hover:text-neutral-600 transition-colors duration-300"
                  />
                </button>
              </div>
            </div>
            <div className="self-stretch p-2.5 rounded-lg justify-center items-center gap-2.5 inline-flex">
              <div className="grow shrink basis-0 text-right text-white/50 text-xs font-normal leading-[18px]">
                {fields.image_url.errors ? (
                  <ErrorList
                    id={fields.image_url.errorId}
                    errors={fields.image_url.errors}
                  />
                ) : (
                  `Max ${MAX_UPLOAD_SIZE / 1024 / 1024} MB`
                )}
              </div>
            </div>
          </div>
          <div className="self-stretch h-[124px] py-1 flex-col justify-start items-start flex">
            <div className="self-stretch h-[38px] py-2.5 flex-col justify-start items-start gap-1 flex">
              <div className="self-stretch justify-start items-center gap-2.5 inline-flex">
                <div className="grow shrink basis-0 text-white/70 text-xs font-medium leading-[18px]">
                  Display Name
                </div>
              </div>
            </div>
            <Label htmlFor={fields.display_name.id} hidden>
              Display Name
            </Label>
            <Input
              {...getInputProps(fields.display_name, { type: 'text' })}
              placeholder="Enter a display name"
              value={displayName}
              onChange={handleDisplayNameChange}
              className="w-full"
            />
            <div className="self-stretch p-2.5 rounded-lg justify-center items-center gap-2.5 inline-flex">
              <div className="grow shrink basis-0 text-right text-white/50 text-xs font-normal leading-[18px]">
                Max {MAX_NAME_LENGTH} characters
              </div>
            </div>
          </div>
          <div className="self-stretch h-[164px] py-1 rounded-xl flex-col justify-start items-start flex">
            <div className="self-stretch h-[38px] py-2.5 flex-col justify-start items-start gap-1 flex">
              <div className="self-stretch justify-start items-center gap-2.5 inline-flex">
                <div className="grow shrink basis-0 text-white/70 text-xs font-medium leading-[18px]">
                  Bio
                </div>
              </div>
            </div>
            <Label htmlFor={fields.description.id} hidden>
              Bio
            </Label>
            <Textarea
              {...getInputProps(fields.description, { type: 'text' })}
              placeholder="Tell us about yourself!"
              value={description}
              onChange={handleDescriptionChange}
              className="h-20"
            />
            <div className="self-stretch p-2.5 rounded-lg justify-center items-center gap-2.5 inline-flex">
              <div className="grow shrink basis-0 text-right text-white/50 text-xs font-normal leading-[18px]">
                Max {DESCRIPTION_MAX_LENGTH} characters
              </div>
            </div>
          </div>
          <Button
            form={form.id}
            disabled={loading}
            onClick={() => {
              handleSubmit
            }}
            className="mx-auto"
          >
            {loading ? (
              isCreateRoute ? (
                <>
                  <Icon
                    name="in-progress"
                    className="animate-spin h-5 w-5 mr-1"
                  />{' '}
                  Creating Profile...
                </>
              ) : (
                <>
                  <Icon
                    name="in-progress"
                    className="animate-spin h-5 w-5 mr-1"
                  />{' '}
                  Updating Profile...
                </>
              )
            ) : isCreateRoute ? (
              'Create Profile'
            ) : (
              'Update Profile'
            )}
          </Button>
        </offChainFetcher.Form>
      </>
    </>
  )
}